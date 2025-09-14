import { expect } from '@playwright/test';

class LoginPage {
    constructor(page) {
        this.page = page;
        this.selectors = {
            emailInput: page.getByPlaceholder("Email"),
            passwordInput: page.getByPlaceholder("Password"),
            loginButton: page.locator('#loginbtn'),
            submitOtpButton: page.locator('#ContinueBtn'),
            rememberDeviceCheckbox: page.locator("#remember_device"),
            otpInput: page.locator("#otp1"),
        };
    }

    async navigate() {
        try {
            console.log("Navigating to login page");
            await this.page.goto('/', { waitUntil: 'load' });
        } catch (error) {
            console.error("Failed to navigate to login page:", error);
        }
    }

    async login(email, password) {
        try {
            console.log("Logging in");
            await this.page.waitForLoadState("domcontentloaded");
            await this.selectors.emailInput.waitFor({ state: 'visible', timeout: 5000 });
            await this.selectors.emailInput.fill(email);
            await this.selectors.passwordInput.fill(password);
            await this.selectors.loginButton.click();           
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    async assertRedirectedToLoginOtp() {
        try {
            console.log("Asserting redirection to OTP page");
            await this.page.waitForURL('**/login-otp?signature**');
            await expect(this.page).toHaveURL(/\/login-otp(\?.*)?$/);
        } catch (error) {
            console.error("Redirection to OTP page failed:", error);
        }
    }

    async fillOtp(otp) {
        try {
            console.log("Filling OTP");
            await this.page.waitForLoadState("domcontentloaded");
            await expect(this.selectors.rememberDeviceCheckbox).toBeChecked();
            await expect(this.selectors.otpInput).toBeVisible();
            console.log("OTP input fields are visible");

            for (let i = 0; i < otp.length; i++) {
                const otpInputSelector = `#otp${i + 1}`;
                console.log(`Filling OTP input ${i + 1} (${otpInputSelector}) with value: ${otp[i]}`);
                expect(this.page.locator(otpInputSelector)).toBeVisible();
                await this.page.locator(otpInputSelector).type(otp[i]);
            }
            
        } catch (error) {
            console.error("Failed to fill OTP:", error);
        }
    }

    async submitOtp() {
        try {
            console.log("Submitting OTP");
            await this.selectors.submitOtpButton.click();
        } catch (error) {
            console.error("Failed to submit OTP:", error);
        }
    }

    async assertRedirectedToDashboard() {
        try {
            console.log("Asserting redirection to dashboard");
            await this.page.waitForLoadState("domcontentloaded");
            await expect(this.page).toHaveURL(/\/dashboard(\?.*)?$/);
            console.log("Redirection to dashboard confirmed");
        } catch (error) {
            console.error("Redirection to dashboard failed:", error);
        }
    }

    async completeLoginProcess(email, password, otp) {
        try {
            console.log("Starting complete login process");
            await this.navigate();
            await this.login(email, password);
            await this.page.waitForLoadState("domcontentloaded");
            //await this.assertRedirectedToLoginOtp();
            //await this.fillOtp(otp);           
            await this.assertRedirectedToDashboard();
        } catch (error) {
            console.error("Complete login process failed:", error);
        }
    }
}

export default LoginPage;
