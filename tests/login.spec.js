import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage';
const loginData = require('../utils/variables.json');

let login;

test.beforeEach(async ({ page }) => {
    // Initialize the LoginPage instance before each test
    login = new LoginPage(page);
});

test('Login form is present and functional', async () => {
    await login.navigate();
    await login.login(loginData.login_master.email, loginData.login_master.password);
    //await login.assertRedirectedToLoginOtp();
});

test('Complete login process redirects to dashboard', async () => {
    await login.completeLoginProcess(
        loginData.login_master.email,
        loginData.login_master.password,
        loginData.login_master.otp
    );
    await login.assertRedirectedToDashboard();
});