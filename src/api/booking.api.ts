import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}

/**
 * Requests to restful-booker, kept in one place so the specs do not deal with
 * URLs, headers and cookies directly.
 */
export class BookingApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly credentials = { username: 'admin', password: 'password123' },
  ) {}

  async ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  async getBookingIds(filter?: {
    firstname?: string;
    lastname?: string;
    checkin?: string;
    checkout?: string;
  }): Promise<APIResponse> {
    return this.request.get('/booking', { params: filter });
  }

  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  async createToken(): Promise<APIResponse> {
    return this.request.post('/auth', { data: this.credentials });
  }

  async getToken(): Promise<string> {
    const response = await this.createToken();
    if (!response.ok()) {
      throw new Error(`Auth failed with status ${response.status()}`);
    }
    const { token } = (await response.json()) as { token: string };
    return token;
  }

  async updateBooking(id: number, booking: Booking, token: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
  }

  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
