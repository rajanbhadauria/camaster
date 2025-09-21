import { expect } from "@playwright/test";
import { createBookingApi } from "../utils/bookingApi";

export class OnlineCheckinPage {
  constructor(page) {
    this.page = page;
    // landing page locators
    this.welcomeMessage = page.locator('.welcome__header-title');
    this.landingPageBookingCode = page.locator('.welcome__reservation-label.notranslate + div');
    this.landingPageConfirmationCode = page.locator('div.welcome__details-item .welcome__reservation-value');
    this.startCheckinButton = page.locator("//span[normalize-space()='Get Started']");
    this.checkinCheckoutDate = page.locator('div.welcome__reservation-value span.welcome__date');
    // Basic Info page locators
    this.basicInfoTitle = page.locator('.basic-info__title'); //.basic-info__title
    this.guestNameInput = page.locator('#basicInfo-fullName');
    this.guestDobInput = page.locator('#basicInfo-dob');
    this.phoneInput = page.getByRole('tel');
    this.emailInput = page.locator('#basicInfo-Email');
    this.genderSelect = page.locator('#basicInfo-nationality').first();
    this.nationalitySelect = page.locator('#basicInfo-nationality').last();
    this.addressInput = page.locator('#update-property-address');
    this.zipInput = page.locator('#basicInfo-fullName');
    this.adultInput = page.locator('#basicInfo-adults');
    this.childInput = page.locator('#basicInfo-children');
    this.nextButton = page.locator("//span[normalize-space()='Next']");

  }

  async compareDates(dateStr1, dateStr2) {
    try {
      // Convert first date like 'Sep 29, 2025(04:00 PM)'
      const parsedDate1 = new Date(dateStr1.replace(/\(.*?\)/, "").trim());

      // Convert second date like '2025-09-29T16:00:00+05:30'
      const parsedDate2 = new Date(dateStr2);

      // Extract only year, month, and date
      const d1 = parsedDate1.getFullYear() + "-" + (parsedDate1.getMonth() + 1) + "-" + parsedDate1.getDate();
      const d2 = parsedDate2.getFullYear() + "-" + (parsedDate2.getMonth() + 1) + "-" + parsedDate2.getDate();

      return d1 === d2;
    } catch (err) {
      console.error("Error parsing dates:", err);
      return false;
    }
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

  async assertWelcomeMessage(firstName) {
    console.log('Booking Welcome Message Verification');
    const welcomeText = await this.welcomeMessage.textContent();
    expect(welcomeText).toContain(firstName);
    console.log('Welcome message contains guest first name from API');
  }

  async assertCheckinCheckoutDate(checkInDate, checkOutDate) {
    console.log('Asserting check-in and check-out dates on Online Checkin Landing Page');
    const dateCheckin = await this.checkinCheckoutDate.first().textContent();
    console.log('Compare Check-in date text:', dateCheckin);
    expect(await this.compareDates(dateCheckin, checkInDate)).toBeTruthy();
    console.log('Check-in date is correct:', dateCheckin);

    const dateCheckout = await this.checkinCheckoutDate.last().textContent();
    console.log('Compare Check-out date text:', dateCheckout);
    expect(await this.compareDates(dateCheckout, checkOutDate)).toBeTruthy();
    console.log('Check-out date is correct:', dateCheckout);
  }

  async assertBookingID(expectedBookingCode) {
    console.log('Asserting booking ID on Online Checkin Landing Page');
    const bookingCode = await this.landingPageBookingCode.textContent();
    expect(bookingCode.trim()).toBe(expectedBookingCode);
    console.log('Booking ID is correct:', bookingCode);
  }

  async assertBookingConfirmationCode(expectedConfirmationCode) {
    console.log('Asserting booking confirmation code on Online Checkin Landing Page');
    const confirmationCode = await this.landingPageConfirmationCode.last().textContent();
    expect(confirmationCode.trim()).toBe(expectedConfirmationCode);
    console.log('Booking confirmation code is correct:', confirmationCode);
  }

  // function to validate landing page with booking details
  async checkinLandingPageValidations(bookingDetails) {

    console.log('Validating Online Checkin Landing Page elements');
    console.log('Booking created via API:', bookingDetails);
    const onlineCheckinLink = bookingDetails.routes.pre_checkin;
    console.log('Online Checkin Link:', onlineCheckinLink);
    await this.goToLandingPage(onlineCheckinLink);
    await expect(this.page.url()).toContain('pre-checkin');
    console.log('Landed on Online Checkin Page');

    await this.assertWelcomeMessage(bookingDetails.guest_first_name);
    await this.assertCheckinCheckoutDate(`${bookingDetails.check_in}`, `${bookingDetails.check_out}`);
    await this.assertBookingID(bookingDetails.id.toString());
    await this.assertBookingConfirmationCode(bookingDetails.confirmation_code.toString());
  }

  async startCheckin() {
    console.log('Starting the check-in process');
    await expect(this.startCheckinButton).toBeVisible();
    await this.startCheckinButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Check-in process started');
  }

  async checkinBasicInfoValidations(bookingDetails) {


    console.log("redirecting to basic info page");
    await this.startCheckin();

    // Add assertions for basic info page elements here
    console.log('Validating Basic Info page elements');
    await this.page.waitForNavigation({ waitUntil: 'load' });
    console.log("Basic info url", this.page.url());
    await this.page.waitForLoadState('networkidle');


    await expect(this.basicInfoTitle.first()).toBeVisible();
    //await expect(this.page.url()).toContain('pre-checkin-step-1');
    console.log('Landed on Basic Info page');
    // Add more element assertions as needed
    await expect(this.basicInfoTitle.first()).toHaveText(/Contact Information/);
    console.log("Page title is matched");
    // match guest name
    await expect(this.guestNameInput.first()).toHaveValue(`${bookingDetails.guest_first_name} ${bookingDetails.guest_last_name}`);
    // Narrow the locator to the first matching input
    console.log("Matched guest name");

    expect(this.emailInput.first()).toHaveValue(bookingDetails.guest_email);
    console.log("Matched guest email");

    expect(this.phoneInput).toHaveValue(bookingDetails.guest_phone);
    console.log("Matched guest phone");

    // Add more validations as needed

  }

} 
