import { expect } from "@playwright/test";
import { createBookingApi } from "../utils/bookingApi";

export class OnlineCheckinPage {
  constructor(page) {
    this.page = page;
    this.welcomeMessage = page.locator('.welcome__header-title');
    this.landingPageBookingCode = page.locator('.welcome__reservation-label.notranslate + div');
    this.landingPageConfirmationCode = page.locator('.welcome__reservation-label.notranslate');
    this.startCheckinButton = page.locator("//span[normalize-space()='Get Started']");
  }

  async goToLandingPage(url) {
    await this.page.goto(url, { waitUntil: 'load' });
    await expect(this.page.url()).toContain('pre-checkin');
    await this.page.waitForLoadState('networkidle');
    await this.landingPageBookingCode.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Navigated to Online Checkin Landing Page:', url);
  }

  async createBookingApi() {
    console.log('Creating booking via API');
    const bookingData = await createBookingApi();
    // console.log('Booking created:', bookingData);
    // return bookingData;
    return true
  }

  async assertLandingPageElements() {
    console.log('Asserting Online Checkin Landing Page elements');
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.landingPageBookingCode).toBeVisible();
    await expect(this.landingPageConfirmationCode).toBeVisible();
    await expect(this.startCheckinButton).toBeVisible();
    console.log('All key elements are visible on the Online Checkin Landing Page');
  }

  async startCheckin() {
    console.log('Starting the check-in process');
    await expect(this.startCheckinButton).toBeVisible();
    await this.startCheckinButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Check-in process started');
  }
}
