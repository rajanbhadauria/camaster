import loginPage from '../../pages/loginPage';

export async function loginAs(page, email, password) {
    const login = new loginPage(page);
    await login.navigate();
    await login.login(email, password);
    await login.assertRedirectedToLoginOtp();
}

export async function completeLogin(page, email, password, otp) {
    const login = new loginPage(page);
    await login.completeLoginProcess(email, password, otp);
}
// Additional helper functions can be added here as needed
// For example, functions to handle OTP submission or dashboard verification

// Example usage in tests:
// import { loginAs } from './utils/loginHelper';
// await loginAs(page, "