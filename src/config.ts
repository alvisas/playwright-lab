export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? 'https://www.saucedemo.com';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';

// Written by tests/auth.setup.ts and read by the browser projects.
export const AUTH_FILE = 'playwright/.auth/standard-user.json';
