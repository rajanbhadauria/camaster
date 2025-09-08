import { expect } from '@playwright/test';

class BookingListingPage {  
  constructor(page){
    this.page = page;
    this.addBookingBtn = page.locator('#add_booking_button');
    this.propertyListing = page.locator('#assigned_property li.list_item');
    this.rentalUnitListing = page.locator('#assigned_rental li.list_item');
    this.bookingSourceList = page.locator('//span[@id="booking_source"]//li//label');
    this.bookingStatusSelect = page.locator('#reservation_status');
    this.bookingPriceInput = page.locator('#total_booking_amount');
    this.bookingInternalNotes = page.locator('#bookingNotes');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('.iti__tel-input[data-intl-tel-input-id="3"]').first();
    this.submitButton = page.locator('div.mt-3 button[name="Save Changes"]');
    this.bookings = [];
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

  async navigate() {
    console.log('Navigating to booking listing page');
    await this.page.goto('/client/v2/bookings', { waitUntil: 'load' });
  }

  async addBooking(booking) {
    // Dynamically import faker
    const { faker } = await import('@faker-js/faker');

    console.log('Adding a new booking');
    await this.addBookingBtn.click();

    const property = await this.selectRandomItem(this.propertyListing);
    await property.click();

    const rentalUnit = await this.selectRandomItem(this.rentalUnitListing);
    await rentalUnit.click();

    const checkinDateSelector = `//div[@id='${this.getFutureDate(10)}']//div[contains(@class, 'dp__pointer')]`;
    const checkOutDateSelector = `//div[@id='${this.getFutureDate(20)}']//div[contains(@class, 'dp__pointer')]`;
    await this.page.locator(checkinDateSelector).click();
    await this.page.locator(checkOutDateSelector).click();

    const bookingSource = await this.selectRandomItem(this.bookingSourceList);
    await bookingSource.click();

    await this.bookingStatusSelect.selectOption(booking.status);
    await this.bookingPriceInput.fill((Math.random() * (1500 - 1000) + 1000).toFixed(2));
    await this.bookingInternalNotes.fill(faker.lorem.sentence());
    await this.firstNameInput.fill(faker.person.firstName());
    await this.lastNameInput.fill(faker.person.lastName());
    await this.emailInput.fill(faker.internet.email());
    await this.phoneInput.fill(faker.phone.number());
    await this.submitButton.click();

    this.bookings.push(booking);
    await this.page.waitForTimeout(10000);
  }

  removeBooking(bookingId) {
    this.bookings = this.bookings.filter(b => b.id !== bookingId);
  }

  getBookings() {
    return this.bookings;
  }
}

export { BookingListingPage };