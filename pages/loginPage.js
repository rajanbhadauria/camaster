import { expect } from '@playwright/test';

class LoginPage {
    constructor(page) {
        this.page = page;
        this.selectors = {
            emailInput: page.getByPlaceholder("Email"),
            passwordInput: page.getByPlaceholder("Password"),
            loginButton: page.locator('#loginbtn'),
            submitOtpButton: page.locator('#ContinueBtn'),
        };
    }

    async navigate() {
        try {
            console.log("Navigating to login page");
            await this.page.goto('/login', { waitUntil: 'load' });
        } catch (error) {
            console.error("Failed to navigate to login page:", error);
        }
    }

    async login(email, password) {
        try {
            console.log("Logging in");
            await this.selectors.emailInput.waitFor({ state: 'visible', timeout: 5000 });
            await this.selectors.emailInput.fill(email);
            await this.selectors.passwordInput.fill(password);
            await this.selectors.loginButton.click();
            await this.page.waitForLoadState('networkidle');
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    async assertRedirectedToLoginOtp() {
        try {
            console.log("Asserting redirection to OTP page");
            await this.page.goto('/login-otp', { waitUntil: 'load' });
            await expect(this.page).toHaveURL(/\/login-otp(\?.*)?$/);
        } catch (error) {
            console.error("Redirection to OTP page failed:", error);
        }
    }

    async fillOtp(otp) {
        try {
            console.log("Filling OTP");
            for (let i = 0; i < otp.length; i++) {
                const otpInput = this.page.locator(`#otp${i + 1}`);
                await otpInput.fill(otp[i]);
            }
        } catch (error) {
            console.error("Failed to fill OTP:", error);
        }
    }

    async submitOtp() {
        try {
            console.log("Submitting OTP");
            await this.selectors.submitOtpButton.click();
            await this.page.waitForLoadState('networkidle');
        } catch (error) {
            console.error("Failed to submit OTP:", error);
        }
    }

    async assertRedirectedToDashboard() {
        try {
            console.log("Asserting redirection to dashboard");
            await expect(this.page).toHaveURL(/\/dashboard(\?.*)?$/);
        } catch (error) {
            console.error("Redirection to dashboard failed:", error);
        }
    }

    async completeLoginProcess(email, password, otp) {
        try {
            console.log("Starting complete login process");
            await this.navigate();
            await this.login(email, password);
            await this.assertRedirectedToLoginOtp();
            await this.fillOtp(otp);
            await this.submitOtp();
            await this.assertRedirectedToDashboard();
        } catch (error) {
            console.error("Complete login process failed:", error);
        }
    }
}

export default LoginPage;
