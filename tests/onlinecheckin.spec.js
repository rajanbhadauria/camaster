import { test, expect } from '@playwright/test';
import { BookingListingPage } from '../pages/bookingListingPage';
import { OnlineCheckinPage } from '../pages/onlineCheckinPage';
import loginData from '../utils/variables.json';
import LoginPage from '../pages/loginPage';
import { BasicInfoPage } from '../pages/basicInfoPage';
import { ArrivalStep } from '../pages/arrivalStep';
//import { on } from 'events';
//import { ar } from '@faker-js/faker';
const axios = require('axios');
const { createBookingApiData, getBookingAPI } = require("../utils/bookingApi");

// Dynamically import faker to support ES Module
let basicInfo;
let booking;
let onlineCheckin;
let login;
let arrivalStep;


test.beforeEach(async ({ page }) => {
  // Initialize the BookingListingPage instance before each test
  booking = new BookingListingPage(page);
  onlineCheckin = new OnlineCheckinPage(page);
  login = new LoginPage(page);
  basicInfo = new BasicInfoPage(page);
  arrivalStep = new ArrivalStep(page);
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

test('Online checkin test', async ({ page }) => {
  const { faker } = await import('@faker-js/faker');

  // --- Create booking via API ---
  console.log('Creating booking via API');
  const bookingData = await createBookingApiData();
  expect(bookingData).toBeDefined();
  expect(bookingData.data).toBeDefined();
  const bookingDetails = bookingData.data;
  console.log('Booking created via API:', bookingDetails);

  // --- Validate Online Checkin Landing Page ---
  await onlineCheckin.checkinLandingPageValidations(bookingDetails);
  console.log('Landing page validations passed');
  await page.waitForTimeout(2000);

  // --- Start Check-in Process ---
  await onlineCheckin.startCheckin();
  console.log('Started check-in process');

  // --- Basic Info Page Validations ---
  await basicInfo.checkinBasicInfoValidations(bookingDetails);
  await basicInfo.validationMessagePageInputs();
  console.log('Basic Info page validations passed');

  // --- Fill Basic Info Form ---
  const fakeGuest = {
    guestName: `${faker.person.firstName()} ${faker.person.lastName()}`,
    guestDob: '21-05-1982',
    phone: faker.phone.number(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode()
  };
  await basicInfo.fillBasicInfoForm(fakeGuest);
  console.log('Filled Basic Info form with:', fakeGuest);

  await basicInfo.nextButton.click();
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');

  // --- Arrival Step Page ---
  await arrivalStep.arrivalTitle.waitFor({ state: 'visible', timeout: 10000 });
  await expect(arrivalStep.arrivalTitle).toBeVisible();
  console.log('Landed on Arrival Info page');

  // --- Back Button Functionality ---
  await expect(onlineCheckin.backBtn).toBeEnabled({ timeout: 5000 });
  await expect(onlineCheckin.backBtn).toBeVisible();
  await onlineCheckin.backBtn.click();
  await page.waitForLoadState('networkidle');
  console.log('Navigated back to Basic Info page');

  // --- Verify Data Persistence ---
  const updatedBookingData = await getBookingAPI(bookingDetails.id);
  expect(updatedBookingData).toBeDefined();
  await basicInfo.validatingFilledBasicInfoForm(updatedBookingData.data);
  console.log('Verified filled data after navigating back');

  // --- Proceed Again to Arrival Step ---
  await basicInfo.nextButton.click();
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  await arrivalStep.arrivalTitle.waitFor({ state: 'visible', timeout: 10000 });
  await expect(arrivalStep.arrivalTitle).toBeVisible();
  console.log('Test completed: Arrival Info page visible after re-navigation');
});
