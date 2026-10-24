import { expect, test } from '../../src/fixtures/test';
import { buildBooking } from '../../src/data/test-data';
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

  test('created booking matches the schema @regression', async ({ bookingApi }) => {
    const createResponse = await bookingApi.createBooking(buildBooking());
    expect(createResponse.status()).toBe(200);

    const created = BookingResponseSchema.parse(await createResponse.json());

    const getResponse = await bookingApi.getBooking(created.bookingid);
    expect(getResponse.status()).toBe(200);
    BookingResponseSchema.shape.booking.parse(await getResponse.json());

    const token = await bookingApi.getToken();
    await bookingApi.deleteBooking(created.bookingid, token);
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
