const axios = require('axios');
const apiData = require('./variables.json').api_master;
const BASE_URL = apiData.API_BASE_URL;
const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer ' + apiData.API_KEY
};

/**
 * Creates a booking via API with random/fake data.
 * @returns {Promise<Object>} The booking API response data.
 */
async function createBookingApiData() {
  const { faker } = await import('@faker-js/faker');
  const property_id = apiData.PROPERTIES;
  const rental_id = apiData.RENTAL;
  const channel_opt = apiData.CHANNELS;
  const amount = Math.floor(Math.random() * (700 - 500 + 1)) + 500;
  const booking_start = new Date().toISOString().slice(0, 10);
  const rand_days = Math.floor(Math.random() * 6) + 5;
  const date_start = new Date(Date.now() + rand_days * 24 * 60 * 60 * 1000);
  const end_date = new Date(date_start.getTime() + 3 * 24 * 60 * 60 * 1000);

  const post_data = {
    property_id,
    rental_id,
    status: 2,
    check_in: date_start.toISOString().slice(0, 10),
    check_out: end_date.toISOString().slice(0, 10),
    booking_time: booking_start,
    guest_email: faker.internet.email(undefined, undefined, "yopmail.com"),
    num_adult: 1,
    num_child: 0,
    channel_code: channel_opt,
    total_price: amount,
    guest_id: Math.floor(Math.random() * (9999999 - 2000000 + 1) + 2000000),
    guest_title: faker.person.prefix(),
    guest_first_name: faker.person.firstName(),
    guest_last_name: faker.person.lastName(),
    guest_phone: "+919945101111",
    guest_mobile: "+919945101111",
    guest_fax: "+919945101111",
    guest_address: faker.location.streetAddress(),
    guest_city: faker.location.city(),
    guest_country: faker.location.country(),
    guest_post_code: faker.location.zipCode(),
    notes: faker.lorem.sentence({ min: 10, max: 16 }),
    total_balance: 500,
    currency_code: "CAD",
    channel_reference: channel_opt,
    guest_comments: faker.lorem.sentence({ min: 10, max: 16 }),
    guest_arrive: "",
    master_id: "repellendus",
    guest_notes: channel_opt,
    access_code: String(Math.floor(Math.random() * (200000 - 100 + 1) + 100)),
    payment_method_id: "reprehenderit",
    stripe_guest_id: "id",
    confirmation_code: 'conf' + (Math.floor(Date.now() / 1000) + Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)),
    language_code: 'en',
    booking_access_code: 'access' + (Math.floor(Date.now() / 1000) + Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)),
  };

  try {
    const response = await axios.post(`${BASE_URL}booking/new`, post_data, { headers: HEADERS });
    return response.data;
  } catch (error) {
    console.error('Error creating booking via API:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Gets booking details by booking ID via API.
 * @param {string|number} booking_id
 * @returns {Promise<Object>} The booking API response data.
 */
async function getBookingAPI(booking_id) {
  try {
    const response = await axios.get(`${BASE_URL}booking/${booking_id}`, { headers: HEADERS });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking via API:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { createBookingApiData, getBookingAPI };
