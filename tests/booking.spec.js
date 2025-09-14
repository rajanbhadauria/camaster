import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage';
import { BookingListingPage } from '../pages/bookingListingPage';
const loginData = require('../utils/variables.json');

test.skip('add a new booking', async ({ page }) => {
    const login = new LoginPage(page);
    await login.completeLoginProcess(
        loginData.login_master.email,
        loginData.login_master.password,
        loginData.login_master.otp
    );
    console.log('Login successful');
    await login.assertRedirectedToDashboard();
    await page.waitForLoadState('domcontentloaded');
    const bookingListing = new BookingListingPage(page);
    await bookingListing.navigateToBookingListing();
    await bookingListing.addBooking({ status: 'confirmed' }); // Pass booking object if needed
});

test('pre-checkin link copy', async ({ context, page }) => {
   
    const login = new LoginPage(page);
    await login.completeLoginProcess(
        loginData.login_master.email,
        loginData.login_master.password,
        loginData.login_master.otp
    );
    await login.assertRedirectedToDashboard();
    await expect(page).toHaveURL(/dashboard/i);

    const bookingListing = new BookingListingPage(page);
    await bookingListing.navigateToBookingListing();
    await bookingListing.assertRedirectedToBooking();
    await expect(page).toHaveURL(/client\/v2\/bookings/);
    await expect(page.locator('#add_booking_button')).toBeVisible();
    console.log('Booking listing page loaded successfully');

    // Uncomment when the feature is stable
    console.log('Attempting to copy pre-checkin link');

    const copiedLink = await bookingListing.copyPrecheckinLink();
    console.log('Copied Pre-checkin Link:', copiedLink);
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto(copiedLink);
});