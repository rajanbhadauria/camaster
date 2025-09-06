import { expect, Page } from '@playwright/test';

class loginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder("Email");
        this.passwordInput = page.getByPlaceholder("Password");
        this.loginButton = page.locator('#loginbtn');
        this.submitOtpButton = page.locator('#ContinueBtn');
    }

    async navigate() {
        console.log("Navigating to login page");
        await this.page.goto('/login', { waitUntil: 'load' });
    }

    async login(email, password) {
        console.log("Filling login form");
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async assertRedirectedToLoginOtp() {
        console.log("Asserting redirection to login OTP page");
        await this.page.goto('/login-otp', { waitUntil: 'load' });
        await expect(this.page).toHaveURL(/\/login-otp(\?.*)?$/);
    }

    async performLoginAndAssert(email, password) {
        console.log("Performing login and asserting redirection to OTP page");
        await this.navigate();
        await this.login(email, password);
        await this.assertRedirectedToLoginOtp();
    }

    async fillOtp(otp) {
        console.log("Filling OTP");
        for (let i = 0; i < otp.length; i++) {
            const otpInput = this.page.locator(`#otp${i + 1}`);
            await otpInput.fill(otp[i]);
        }
    }

    async submitOtp() {
        console.log("Submitting OTP");
        await this.submitOtpButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async assertRedirectedToDashboard() {
        console.log("Asserting redirection to dashboard");
        await expect(this.page).toHaveURL(/\/dashboard(\?.*)?$/);
    }

    async completeLoginProcess(email, password, otp) {
        console.log("Completing full login process");        
        await this.performLoginAndAssert(email, password);
        await this.fillOtp(otp);
        await this.submitOtp();
        await this.assertRedirectedToDashboard();
    }
}

export default loginPage;
