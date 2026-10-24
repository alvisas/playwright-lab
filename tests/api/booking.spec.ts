import type { BookingResponse } from '../../src/api/booking.api';
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

  test('creates a booking and reads it back @regression', async ({ bookingApi }) => {
    const payload = buildBooking();

    const createResponse = await bookingApi.createBooking(payload);
    expect(createResponse.status()).toBe(200);

    const created = (await createResponse.json()) as BookingResponse;
    expect(created.bookingid).toBeGreaterThan(0);
    expect(created.booking).toEqual(payload);

    const getResponse = await bookingApi.getBooking(created.bookingid);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toEqual(payload);

    // Remove the booking again; the demo API is shared with other people.
    const token = await bookingApi.getToken();
    const deleteResponse = await bookingApi.deleteBooking(created.bookingid, token);
    expect(deleteResponse.status()).toBe(201);
  });

  test('updates and deletes a booking with a valid token @regression', async ({ bookingApi }) => {
    const createResponse = await bookingApi.createBooking(buildBooking());
    const created = (await createResponse.json()) as BookingResponse;
    const token = await bookingApi.getToken();

    const updatedPayload = buildBooking({
      firstname: 'Updated',
      lastname: uniqueName('Customer'),
      totalprice: 999,
      additionalneeds: 'Late checkout',
    });

    const updateResponse = await bookingApi.updateBooking(created.bookingid, updatedPayload, token);
    expect(updateResponse.status()).toBe(200);
    expect(await updateResponse.json()).toEqual(updatedPayload);

    const deleteResponse = await bookingApi.deleteBooking(created.bookingid, token);
    expect(deleteResponse.status()).toBe(201);

    const getResponse = await bookingApi.getBooking(created.bookingid);
    expect(getResponse.status()).toBe(404);
  });

  test('rejects updates with an invalid token @regression', async ({ bookingApi, request }) => {
    const createResponse = await bookingApi.createBooking(buildBooking());
    const created = (await createResponse.json()) as BookingResponse;
    const token = await bookingApi.getToken();

    const response = await request.put(`/booking/${created.bookingid}`, {
      data: buildBooking(),
      headers: { Cookie: 'token=not-a-real-token' },
    });

    expect(response.status()).toBe(403);

    await bookingApi.deleteBooking(created.bookingid, token);
  });

  test('returns 404 for a booking that does not exist @regression', async ({ bookingApi }) => {
    const response = await bookingApi.getBooking(999_999_999);

    expect(response.status()).toBe(404);
  });
});
