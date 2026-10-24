import { expect, test } from '../../src/fixtures/test';
import { buildBooking, uniqueName } from '../../src/data/test-data';

test.describe('Booking API', () => {
  test('service is healthy @smoke', async ({ bookingApi }) => {
    const response = await bookingApi.ping();

    expect(response.status()).toBe(201);
  });

  test('returns a list of booking ids @smoke', async ({ bookingApi }) => {
    const response = await bookingApi.getBookingIds();

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Array<{ bookingid: number }>;
    expect(body.length).toBeGreaterThan(0);
  });

  test('creates a booking and reads it back @regression', async ({ bookingApi, createBooking }) => {
    const payload = buildBooking();
    const created = await createBooking(payload);

    expect(created.booking).toEqual(payload);

    const getResponse = await bookingApi.getBooking(created.bookingid);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toEqual(payload);
  });

  test('updates and deletes a booking with a valid token @regression', async ({
    bookingApi,
    authToken,
    createBooking,
  }) => {
    const created = await createBooking();
    const updated = buildBooking({
      firstname: 'Updated',
      lastname: uniqueName('Customer'),
      totalprice: 999,
      additionalneeds: 'Late checkout',
    });

    await test.step('update the booking', async () => {
      const response = await bookingApi.updateBooking(created.bookingid, updated, authToken);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(updated);
    });

    await test.step('delete the booking', async () => {
      const response = await bookingApi.deleteBooking(created.bookingid, authToken);
      expect(response.status()).toBe(201);

      const getResponse = await bookingApi.getBooking(created.bookingid);
      expect(getResponse.status()).toBe(404);
    });
  });

  test('rejects updates with an invalid token @regression', async ({ request, createBooking }) => {
    const created = await createBooking();

    const response = await request.put(`/booking/${created.bookingid}`, {
      data: buildBooking(),
      headers: { Cookie: 'token=not-a-real-token' },
    });

    expect(response.status()).toBe(403);
  });

  test('returns 404 for a booking that does not exist @regression', async ({ bookingApi }) => {
    const response = await bookingApi.getBooking(999_999_999);

    expect(response.status()).toBe(404);
  });
});
