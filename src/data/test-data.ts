import type { Booking } from '../api/booking.api';

export const CREDENTIALS = {
  standard: {
    username: process.env.E2E_USERNAME ?? 'standard_user',
    password: process.env.E2E_PASSWORD ?? 'secret_sauce',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
} as const;

export const API_CREDENTIALS = {
  username: process.env.API_USERNAME ?? 'admin',
  password: process.env.API_PASSWORD ?? 'password123',
} as const;

export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  onesie: 'Sauce Labs Onesie',
} as const;

export const CUSTOMER = {
  firstName: 'Alvis',
  lastName: 'QA',
  postalCode: '40111',
} as const;

export const INVALID_LOGIN_CASES = [
  {
    name: 'empty username',
    username: '',
    password: 'secret_sauce',
    error: 'Username is required',
  },
  {
    name: 'empty password',
    username: 'standard_user',
    password: '',
    error: 'Password is required',
  },
  {
    name: 'wrong password',
    username: 'standard_user',
    password: 'wrong_password',
    error: 'Username and password do not match any user in this service',
  },
] as const;

export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Alvis',
    lastname: uniqueName('QA'),
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2026-01-10', checkout: '2026-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
