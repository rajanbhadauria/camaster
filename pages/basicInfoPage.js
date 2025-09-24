import { expect } from '@playwright/test';

export class BasicInfoPage {
    constructor(page) {
        this.page = page;
        // Basic Info page locators            
        this.basicInfoTitle = page.locator('.basic-info__title'); //.basic-info__title
        this.guestNameInput = page.locator('#basicInfo-fullName').first();
        this.guestNameInputError = this.guestNameInput.locator('+ div.invalid-feedback');
        this.guestDobInput = page.locator('#basicInfo-dob');
        this.guestDobInputError = page.locator('.cac-form__date-input-wrapper + div.invalid-feedback');
        this.phoneInput = page.locator('.iti__tel-input');
        this.phoneInputError = page.locator('small span.translate');
        this.emailInput = page.locator('#basicInfo-Email');
        this.emailInputError = this.emailInput.locator('+ div.invalid-feedback');
        this.genderSelect = page.locator('#basicInfo-nationality').first();
        this.genderSelectError = page.locator('span.invalid-feedback').first();
        this.nationalitySelect = page.locator('#basicInfo-nationality').last();
        this.nationalitySelectError = this.nationalitySelect.locator('+ div.invalid-feedback');
        this.addressInput = page.locator('#update-property-address');
        this.addressInputError = this.addressInput.locator('+ div.invalid-feedback');
        this.zipInput = page.locator('#basicInfo-fullName').last();
        this.zipInputError = page.locator('span.invalid-feedback').last();
        this.adultInput = page.locator('#basicInfo-adults');
        this.childInput = page.locator('#basicInfo-children');
        this.nextButton = page.locator("//span[normalize-space()='Next']");
        
    }

    async clearAndFillBasicInfoForm(bookingDetails, updatedDetails) {
        // Clear and fill the form fields with updated details
        await this.guestNameInput.clear('');
        await this.guestDobInput.clear('');
        await this.phoneInput.clear('');
        await this.emailInput.clear('');        
        // await this.genderSelect.click();
        // await this.page.keyboard.press('Escape');
        // await this.nationalitySelect.click();
        // await this.page.keyboard.press('Escape');
        await this.addressInput.clear('');
        await this.zipInput.clear('');
        await this.adultInput.clear('');
        await this.childInput.clear('');
    }

    async checkinBasicInfoValidations(bookingDetails) {       

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

        const actualPhone = await this.phoneInput.inputValue();
        expect(actualPhone.replace(/\s+/g, '')).toBe(bookingDetails.guest_phone.replace(/\s+/g, ''));
        console.log("Matched guest phone");

        await expect(this.addressInput).toHaveValue(bookingDetails.guest_address);
        console.log("Matched guest address");
        await expect(this.zipInput.last()).toHaveValue(bookingDetails.guest_post_code);
        console.log("Matched guest zip");
        // Add more validations as needed
    }

    async validationMessagePageInputs() {
        await this.clearAndFillBasicInfoForm()
        console.log('Cleared Basic Info form fields to check validation messages');
        await this.nextButton.click();
        console.log(await this.guestNameInputError.textContent());
        await expect(this.guestNameInputError).toHaveText('Full name is required *');
        console.log('Validation message for empty guest name is displayed');
        
        await expect(this.guestDobInputError).toHaveText('Date of birth is required *');
        console.log('Validation message for empty DOB is displayed');
        
        await expect(this.phoneInputError).toHaveText('Invalid phone number.');
        console.log('Validation message for empty phone number is displayed');

        await expect(this.emailInputError).toHaveText('Email Address is required *');
        console.log('Validation message for empty email is displayed');

        await expect(this.genderSelectError).toHaveText('Gender is required *');
        console.log('Validation message for empty gender is displayed');

        expect(this.addressInputError).toHaveText('Address is required *');
        console.log('Validation message for empty address is displayed');

        await expect(this.zipInputError).toHaveText('Zip code is required *');
        console.log('Validation message for empty zip code is displayed');
    }
}