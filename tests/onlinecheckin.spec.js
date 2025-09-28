import { test, expect } from '@playwright/test';
import { BookingListingPage } from '../pages/bookingListingPage';
import { OnlineCheckinPage } from '../pages/onlineCheckinPage';
import loginData from '../utils/variables.json';
import LoginPage from '../pages/loginPage';
import { BasicInfoPage } from '../pages/basicInfoPage';
import { on } from 'events';
const axios = require('axios');
const { createBookingApiData, getBookingAPI } = require("../utils/bookingApi");

// Dynamically import faker to support ES Module
let basicInfo;
let booking;
let onlineCheckin;
let login;


test.beforeEach(async ({ page }) => {
  // Initialize the BookingListingPage instance before each test
  booking = new BookingListingPage(page);
  onlineCheckin = new OnlineCheckinPage(page);
  login = new LoginPage(page);
  basicInfo = new BasicInfoPage(page);
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
  const { faker } = await import('@faker-js/faker');
  console.log('Creating booking via API');
  const bookingData = await createBookingApiData();
  console.log('Booking created via API:', bookingData);
  expect(bookingData).toBeDefined();
  expect(bookingData.data).toBeDefined();

  const bookingDetails = bookingData.data;
  await onlineCheckin.checkinLandingPageValidations(bookingDetails);
  await page.waitForTimeout(2000);
  console.log('All assertions passed on Online Checkin Landing Page, starting check-in process now with basic details');

  // basic info page validations
  console.log('Starting Basic Info page validations');
  await onlineCheckin.startCheckin();
  console.log('Check-in process started, validating Basic Info page now');
  await basicInfo.checkinBasicInfoValidations(bookingDetails);
  console.log('Basic Info page clear and fill form validations');
  await basicInfo.validationMessagePageInputs();
  console.log('Filled Basic Info form ');
  await basicInfo.fillBasicInfoForm({
    guestName: `${faker.person.firstName()} ${faker.person.lastName()}`,
    guestDob: '21-05-1982',
    phone: faker.phone.number(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode()
  });
  console.log('Filled Basic Info form with new data');  
  await basicInfo.nextButton.click();
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  await basicInfo.arrivalTitle.waitFor({ state: 'visible', timeout: 10000 });
  await expect(basicInfo.arrivalTitle).toBeVisible();
  console.log('Landed on Arrival Info page');
  await expect(onlineCheckin.backBtn).toBeEnabled({ timeout: 5000 });
  await expect(onlineCheckin.backBtn).toBeVisible();
  await page.waitForLoadState('networkidle');  
  //await page.waitForTimeout(2000);
  console.log('Clicked on back button on Basic Info page');
  await onlineCheckin.backBtn.click();
  console.log('Clicked');
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  console.log('Verifying filled data');
  const updatedBookingData = await getBookingAPI(bookingDetails.id);
  console.log('Fetched updated booking data from API:', updatedBookingData);
  await basicInfo.validatingFilledBasicInfoForm(updatedBookingData.data);
  await page.waitForTimeout(2000);
  console.log('All assertions passed on Basic Info Page');
});
