import { expect, test } from '../../src/fixtures/test';
import {
  AuthTokenSchema,
  BookingIdListSchema,
  BookingResponseSchema,
  ErrorResponseSchema,
} from '../../src/schemas/booking.schema';

test.describe('Booking API contract @contract', () => {
  test('booking id list matches the schema @smoke', async ({ bookingApi }) => {
    const response = await bookingApi.getBookingIds();
    expect(response.status()).toBe(200);

    BookingIdListSchema.parse(await response.json());
  });

  test('created booking matches the schema @regression', async ({ bookingApi, createBooking }) => {
    const created = await createBooking();
    BookingResponseSchema.parse(created);

    const getResponse = await bookingApi.getBooking(created.bookingid);
    expect(getResponse.status()).toBe(200);
    BookingResponseSchema.shape.booking.parse(await getResponse.json());
  });

  test('auth token matches the schema @regression', async ({ bookingApi }) => {
    const response = await bookingApi.createToken();
    expect(response.status()).toBe(200);

    AuthTokenSchema.parse(await response.json());
  });

  test('rejected login matches the error schema @regression', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'wrong-password' },
    });

    expect(response.status()).toBe(200);
    ErrorResponseSchema.parse(await response.json());
  });
});
