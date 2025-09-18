import {test, expect} from '@playwright/test';
import { BookingListingPage } from '../pages/bookingListingPage';
import { OnlineCheckinPage } from '../pages/onlineCheckinPage';
import loginData from '../utils/variables.json';
import LoginPage from '../pages/loginPage';
const axios = require('axios');
const { createBookingApiData } = require("../utils/bookingApi");

// Dynamically import faker to support ES Module
let th;
let booking;
let onlineCheckin;
let login;


test.beforeEach(async ({ page }) => {
    // Initialize the BookingListingPage instance before each test
    booking = new BookingListingPage(page);
    onlineCheckin = new OnlineCheckinPage(page);
    login = new LoginPage(page);    

});

test.skip('Online Checkin landing page data validation', async ({ page }) => {
  await login.completeLoginProcess(
    loginData.login_master.email,
    loginData.login_master.password,
    loginData.login_master.otp
  );
  await login.assertRedirectedToDashboard();
  await expect(booking.page).toHaveURL(/dashboard/i);
  console.log('Login successful');

  await booking.navigateToBookingListing();
  await booking.assertRedirectedToBooking();
  await expect(booking.page).toHaveURL(/client\/v2\/bookings/);
  await booking.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 10000 });
  await booking.addBookingBtn.waitFor({ state: 'visible', timeout: 5000 });

  console.log('Copying Online Checkin Link to Booking Listing Page');
  const link = await booking.copyPrecheckinLink();
  console.log('Copied Online Checkin Link:', link);

  await onlineCheckin.goToLandingPage(link);
  await expect(page.url()).toContain('pre-checkin'); // ✅ page is now defined
  console.log('Landed on Online Checkin Page');
  await page.waitForTimeout(15000);
});

test('should create a booking via API', async ({ page }) => {
  console.log('Creating booking via API');
  const bookingData = await createBookingApiData();
  console.log('Booking created via API:', bookingData);
  expect(bookingData).toBeDefined();
  expect(bookingData.data).toBeDefined();
  
  const bookingDetails = bookingData.data;
  console.log('Booking created via API:', bookingDetails);
  const onlineCheckinLink = bookingDetails.routes.pre_checkin;

  console.log('Online Checkin Link:', onlineCheckinLink);
  await onlineCheckin.goToLandingPage(onlineCheckinLink);
  await expect(page.url()).toContain('pre-checkin');
  console.log('Landed on Online Checkin Page');

  await onlineCheckin.landingPageBookingCode.waitFor({ state: 'visible', timeout: 10000 });
  const bookingCode = await onlineCheckin.landingPageBookingCode.textContent();
  console.log('Booking Code on Landing Page:', bookingCode);
  expect(bookingCode).toBe(bookingDetails.id.toString());
  console.log('Booking code matches booking ID from API');

  console.log('Booking Welcome Message Verification');
  const welcomeText = await onlineCheckin.welcomeMessage.textContent();
  expect(welcomeText).toContain(bookingDetails.guest_first_name);
  console.log('Welcome message contains guest first name from API');
  await onlineCheckin.startCheckin();
  await page.waitForTimeout(10000);
  


});
