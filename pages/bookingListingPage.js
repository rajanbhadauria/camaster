import { expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

class BookingListingPage {
  constructor() {
    this.page = page;
    this.addBookingBtn = page.getById('add_booking_button');
    this.propertyListing = page.locator('#assigned_property li.list_item');
    this.rentalUnitListing = page.locator('#assigned_rental li.list_item');
    this.checkinDate = page.locator("//div[@id='" + this.getFutureDate(10) + "']//div[contains(@class, 'dp__pointer')]");
    this.checkOutDate = page.locator("//div[@id='" + this.getFutureDate(20) + "']//div[contains(@class, 'dp__pointer')]");
    this.bookingSourceList = page.locator('//span[@id="booking_source"]//li//label');
    this.bookingStatusSelect = this.page.getById('reservation_status')
    this.bookingPriceInput = page.locator("#total_booking_amount");
    this.bookingInternalNotes = page.locator("#bookingNotes");
    this.firstNameInput = page.locator("#first_name");
    this.lastNameInput = page.locator("#last_name");
    this.emailInput = page.locator("#email");
    this.phoneInput = page.locator(".iti__tel-input[data-intl-tel-input-id='3']").first();
    this.submitButton = page.locator("div.mt-3 button[name='Save Changes']");
  }

  getFutureDate(daysAfterToday = 10) {
    const today = new Date();
    today.setDate(today.getDate() + daysAfterToday);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectRandomItemFromList(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  async navigate() {
    console.log("Navigating to booking listing page");
    await this.page.goto('/client/v2/bookings', { waitUntil: 'load' });
  }


  addBooking(booking) {
    this.addBookingBtn.click();
    this.propertyListing.nth(selectRandomItemFromList(this.propertyListing)).click();
    this.rentalUnitListing.nth(selectRandomItemFromList(this.rentalUnitListing)).click();
    this.checkinDate.click();
    this.checkOutDate.click();
    this.bookingSourceList.nth(selectRandomItemFromList(this.bookingSourceList)).click();
    this.bookingStatusSelect.selectOption(booking.status);
    this.bookingPriceInput.fill((Math.random() * (1500 - 1000) + 1000).toString());
    this.bookingInternalNotes.fill(faker.lorem.sentence());
    this.firstNameInput.fill(faker.name.firstName());
    this.lastNameInput.fill(faker.name.lastName());
    this.emailInput.fill(faker.internet.email());
    this.phoneInput.fill(faker.phone.phoneNumber());
    this.submitButton.click();
    this.bookings.push(booking);
    this.page.waitFor(10000)
  }

  removeBooking(bookingId) {
    this.bookings = this.bookings.filter(b => b.id !== bookingId);
  }

  getBookings() {
    return this.bookings;
  }
}
module.exports = { BookingListingPage };