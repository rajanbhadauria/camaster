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
    await login.assertRedirectedToDashboard();

    const bookingListing = new BookingListingPage(page);
    await bookingListing.navigate();
    await bookingListing.addBooking({ status: 'confirmed' }); // Pass booking object if needed
});

test('pre-checkin link copy', async ({ page }) => {
    const login = new LoginPage(page);
    await login.completeLoginProcess(
        loginData.login_master.email,
        loginData.login_master.password,
        loginData.login_master.otp
    );
    console.log('Login successful');
    await login.assertRedirectedToDashboard();

    const bookingListing = new BookingListingPage(page);
    console.log('Navigating to booking listing page');
    await bookingListing.navigate();

    // const copiedLink = await bookingListing.copyPrecheckinLink();
    // console.log('Copied Pre-checkin Link:', copiedLink);
    // const newContext = await browser.newContext();
    // const newPage = await newContext.newPage();
    // await newPage.goto(copiedLink);
});