import { test as base, expect } from '@playwright/test';
import { BookingApi, type Booking, type BookingResponse } from '../api/booking.api';
import { API_BASE_URL } from '../config';
import { API_CREDENTIALS, buildBooking } from '../data/test-data';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';

type CreateBooking = (overrides?: Partial<Booking>) => Promise<BookingResponse>;

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Inventory page opened with the session saved by the setup project. */
  loggedInInventoryPage: InventoryPage;
  bookingApi: BookingApi;
  /** Creates a booking and deletes it when the test ends, even on failure. */
  createBooking: CreateBooking;
};

type WorkerFixtures = {
  /** One API token per worker instead of one per test. */
  authToken: string;
};

export const test = base.extend<Fixtures, WorkerFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  loggedInInventoryPage: async ({ page }, use) => {
    await page.goto('/inventory.html');
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },

  bookingApi: async ({ request }, use) => {
    await use(new BookingApi(request, API_CREDENTIALS));
  },

  authToken: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({ baseURL: API_BASE_URL });

      try {
        await use(await new BookingApi(request, API_CREDENTIALS).getToken());
      } finally {
        await request.dispose();
      }
    },
    { scope: 'worker' },
  ],

  createBooking: async ({ bookingApi, authToken }, use) => {
    const created: number[] = [];

    await use(async (overrides) => {
      const response = await bookingApi.createBooking(buildBooking(overrides));
      if (!response.ok()) {
        throw new Error(`Create booking failed with status ${response.status()}`);
      }

      const booking = (await response.json()) as BookingResponse;
      if (typeof booking.bookingid === 'number') {
        created.push(booking.bookingid);
      }

      return booking;
    });

    for (const id of created) {
      await bookingApi.deleteBooking(id, authToken);
    }
  },
});

export { expect };
