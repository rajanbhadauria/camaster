import {test, expect} from '@playwright/test';
import loginPage from '../pages/loginPage';
const loginData = JSON.parse(JSON.stringify(require('../utils/variables.json')));

test('login form is present', async ({page}) => {
    const login = new loginPage(page);
    await login.navigate();
    await login.login(loginData.login_master.email, loginData.login_master.password);
    await login.assertRedirectedToLoginOtp();           
    //await expect(page).toHaveURL(/\/login1-otp(\?.*)?$/);
});

test('complete login process', async ({page}) => {
    const login = new loginPage(page);
    await login.completeLoginProcess(
        loginData.login_master.email,
        loginData.login_master.password,
        loginData.login_master.otp
    );
    await login.assertRedirectedToDashboard();
});