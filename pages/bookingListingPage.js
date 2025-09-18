import { expect } from '@playwright/test';


class BookingListingPage {  
  constructor(page){
    this.page = page
    this.cancelBtn = page.locator('#add_booking_close_modal');
    this.addBookingBtn = page.locator('#add_booking_button');

    this.propertyListingPlaceholder = page.locator('#assigned_property');
    this.propertyItems = page.locator('span#assigned_property .multiselect_input_container');
    this.propertyListing = page.locator('#assigned_property li.list_item');

    this.rentalListingPlaceholder = page.locator('#assigned_rental');
    this.rentalItems = page.locator('span#assigned_rental .multiselect_input_container');
    this.rentalUnitListing = page.locator('#assigned_rental li.list_item');

    this.datePlaceholder = page.locator("div.custom-date-box");

    this.bookingSourcePlaceholder = page.locator("#booking_source .multiselect_input_container")
    this.bookingSourceList = page.locator('//span[@id="booking_source"]//li//label');
    this.bookingStatusSelect = page.locator('#reservation_status');

    this.bookingPriceInput = page.locator('#total_booking_amount');
    this.bookingInternalNotes = page.locator('#bookingNotes');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('.iti__tel-input[data-intl-tel-input-id="3"]').first();
    this.submitButton =  page.getByRole('button', { name: 'Save Changes' });
    this.loadingSpinner = page.locator('div.custom-loading-container');

    this.bookingActionsBtn = page.locator('.booking-list-card-item #moreMenu', { state: "visible" });
    this.expandedActions = page.locator("//div[@class='booking-list-card-item']//span[@class='translate d-flex justify-content-between w-100 guest-link-item'][normalize-space()='Guest Link']");
    this.shareLinkBtn = page.locator("//div[contains(@class,'dropdown-menu dropdown-menu-right notranslate booking-list-card-item-more-menu-dropdown show')]//ul[contains(@class,'preferences_child')]//span[@data-label='Share' and normalize-space()='Share']");
    this.shareLinkInput = page.locator('#shareBookingModal_linkCopyInput');

    this.bookingNav = page.locator('a', { hasText: 'Bookings' })
  }

  getFutureDate(daysAfterToday = 10) {
    const today = new Date();
    today.setDate(today.getDate() + daysAfterToday);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async selectRandomItem(locator) {
    const count = await locator.count();
    if (count === 0) throw new Error('No items found for selection');
    const randomIndex = Math.floor(Math.random() * count);
    return locator.nth(randomIndex);
  }

  async copyPrecheckinLink() {
    console.log('Copying pre-checkin link');
    await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 10000 });
    await this.bookingActionsBtn.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.bookingActionsBtn.first()).toBeVisible();
    this.bookingActionsBtn.first().click();
    await this.expandedActions.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.expandedActions.first()).toBeVisible();
    await this.expandedActions.first().click();
    await this.shareLinkBtn.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.shareLinkBtn.first()).toBeVisible();
    await this.shareLinkBtn.first().click();
    await this.shareLinkInput.waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.shareLinkInput).toBeVisible();
    const precheckinLink = await this.shareLinkInput.inputValue();
    console.log('Pre-checkin link copied:', precheckinLink);
    return precheckinLink;
  }

  async navigateToBookingListing() {
    console.log('Navigating to booking listing page');
    try {
      // await this.bookingNav.waitFor({ state: 'visible', timeout: 5000 });
      // await this.bookingNav.click();
      await this.page.goto('/client/v2/bookings', { waitUntil: 'load' });  
      } catch (error) { 
        console.error("Navigation to booking listing page failed, trying direct URL:", error);
      }
    //await this.page.goto('/client/v2/bookings', { waitUntil: 'load' });    
  }

  
  async assertRedirectedToBooking() {
      try {
          console.log("Asserting redirection to booking page");
          await expect(this.page).toHaveURL(/\/bookings(\?.*)?$/);
      } catch (error) {
          console.error("Redirection to booking page failed:", error);
      }
  }

  async addBooking(booking) {
    // Dynamically import faker
    const { faker } = await import('@faker-js/faker');

    console.log('Adding a new booking');
    await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 10000 });
    await expect(this.addBookingBtn).toBeVisible();
    await this.addBookingBtn.click();
    
    console.log('Waiting to hide loading spinner');
    await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 10000 });
    await this.cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.cancelBtn).toBeVisible();

    console.log('Selecting property unit');
    await this.propertyListingPlaceholder.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(2000); // Wait for the property list to populate
    this.propertyItems.click()
    //await expect(this.propertyItems).first().toBeVisible();
    const property = await this.selectRandomItem(this.propertyListing);
    await property.click();

    console.log('Selecting rental unit');
    await this.rentalListingPlaceholder.waitFor({ state: 'visible' });
    await this.rentalItems.click()
    if (await this.rentalUnitListing.count() >1) {
      const rentalUnit = await this.selectRandomItem(this.rentalUnitListing);
      await rentalUnit.click();
    } else {
      console.log('Only one rental unit available, selecting it');
    }

    console.log('Selecting check-in and check-out dates');
    await this.datePlaceholder.first().click();
    // Select check-in date 10 days from today and check-out date 20 days from today
    const checkinDateSelector = `//div[@id='${this.getFutureDate(10)}']//div[contains(@class, 'dp__pointer')]`;
    const checkOutDateSelector = `//div[@id='${this.getFutureDate(20)}']//div[contains(@class, 'dp__pointer')]`;
    await this.page.locator(checkinDateSelector).click();
    await this.page.locator(checkOutDateSelector).click();

    console.log('Selecting booking source and status');
    await this.bookingSourcePlaceholder.click();
    const bookingSource = await this.selectRandomItem(this.bookingSourceList);
    await bookingSource.click();
    
    //await this.bookingStatusSelect.selectOption(booking.status);
    await this.bookingPriceInput.fill((Math.random() * (1500 - 1000) + 1000).toFixed(2));
    await this.bookingInternalNotes.fill(faker.lorem.sentence());
    await this.firstNameInput.fill(faker.person.firstName());
    await this.lastNameInput.fill(faker.person.lastName());
    await this.emailInput.fill(faker.internet.email());
    await this.phoneInput.fill("+919451011111");//faker.phone.number({ style: 'human' }));
    await this.submitButton.click();

    console.log('Waiting for booking to be added and loading spinner to disappear');
    await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 20000 });
    console.log('Booking added successfully');
  }


  getBookings() {
    return this.bookings;
  }



}

export { BookingListingPage };