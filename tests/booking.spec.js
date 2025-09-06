import {test, expect} from '@playwright/test';
import loginPage from '../pages/loginPage';
const loginData = JSON.parse(JSON.stringify(require('../utils/variables.json')));


test.skip('add a new booking', async ({page}) => {
    const login = new loginPage(page);
    await login.completeLoginProcess(
        loginData.login_master.email,
        loginData.login_master.password,
        loginData.login_master.otp
    );
    await login.assertRedirectedToDashboard();

    const bookingListing = new bookingListingPage(page);
    await bookingListing.navigate();
    await bookingListing.addBooking();    
});