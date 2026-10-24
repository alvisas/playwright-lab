# Playwright Lab

[![Playwright CI](https://github.com/alvisas/playwright-lab/actions/workflows/playwright.yml/badge.svg)](https://github.com/alvisas/playwright-lab/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Playwright and TypeScript test suite for two public demo applications: the shopping flow on saucedemo and the booking lifecycle on restful-booker. It is a personal project, so the targets stay public and the suite runs without accounts, API keys or a staging server.

Latest report: https://alvisas.github.io/playwright-lab/

## Coverage

### End-to-end: saucedemo.com

| Area      | Scenario                                       | Tag           |
| --------- | ---------------------------------------------- | ------------- |
| Login     | standard user can sign in                      | `@smoke`      |
| Login     | locked out user is rejected                    | `@regression` |
| Login     | empty username, empty password, wrong password | `@regression` |
| Inventory | six products with the expected names           | `@smoke`      |
| Inventory | price sorting, low to high                     | `@regression` |
| Inventory | name sorting, Z to A                           | `@regression` |
| Inventory | add and remove a product updates the badge     | `@smoke`      |
| Cart      | selected items stay in the cart                | `@smoke`      |
| Cart      | removing an item updates the badge             | `@regression` |
| Cart      | continue shopping returns to the inventory     | `@regression` |
| Checkout  | complete an order                              | `@smoke`      |
| Checkout  | first name is required                         | `@regression` |
| Checkout  | order total equals subtotal plus tax           | `@regression` |

### API: restful-booker

| Scenario                                  | Tag           |
| ----------------------------------------- | ------------- |
| Health check on `/ping`                   | `@smoke`      |
| List booking ids                          | `@smoke`      |
| Create a booking, read it back, delete it | `@regression` |
| Update and delete with a valid token      | `@regression` |
| Update with an invalid token returns 403  | `@regression` |
| Missing booking returns 404               | `@regression` |
| Response bodies match the Zod schemas     | `@contract`   |

A full run has 56 tests: 15 E2E scenarios on Chromium, Firefox and WebKit, one authentication setup per browser project, and 10 API tests.

## Structure

```
.
├── .github/workflows/playwright.yml
├── src/
│   ├── api/booking.api.ts
│   ├── config.ts
│   ├── data/test-data.ts
│   ├── fixtures/test.ts
│   ├── pages/
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── inventory.page.ts
│   │   ├── cart.page.ts
│   │   └── checkout.page.ts
│   └── schemas/booking.schema.ts
├── tests/
│   ├── auth.setup.ts
│   ├── api/
│   │   ├── booking.spec.ts
│   │   └── contract.spec.ts
│   └── e2e/
│       ├── login.spec.ts
│       ├── inventory.spec.ts
│       ├── cart.spec.ts
│       └── checkout.spec.ts
├── playwright.config.ts
└── package.json
```

Selectors and page actions are kept in `src/pages`. Shared fixtures, test data and the API client live next to them, so specs in `tests` only describe scenarios and assertions.

## Setup

Requires Node.js 22 or newer.

```bash
git clone https://github.com/alvisas/playwright-lab.git
cd playwright-lab
npm install
npx playwright install
```

## Commands

| Command               | Description                |
| --------------------- | -------------------------- |
| `npm test`            | Run all projects           |
| `npm run test:e2e`    | E2E on Chromium            |
| `npm run test:api`    | API tests                  |
| `npm run test:smoke`  | Tests tagged `@smoke`      |
| `npm run test:headed` | E2E with a visible browser |
| `npm run test:ui`     | Playwright UI mode         |
| `npm run report`      | Open the last HTML report  |
| `npm run lint`        | ESLint                     |
| `npm run format`      | Prettier                   |
| `npm run typecheck`   | TypeScript check           |

## Authentication

`tests/auth.setup.ts` signs in once per browser project and saves the session to `playwright/.auth/standard-user.json`, which is not committed. The browser projects depend on the setup and reuse the file. The login spec opts out with `test.use({ storageState: { cookies: [], origins: [] } })` because those tests need a clean browser.

The setup project runs on Chromium by default, so every CI browser job installs Chromium as well.

## Configuration

`src/config.ts` reads the base URLs from environment variables and falls back to the public demo sites. The demo credentials can be overridden in `src/data/test-data.ts`.

```bash
E2E_BASE_URL=https://staging.example.com \
API_BASE_URL=https://api.staging.example.com \
npm test
```

For local overrides, copy `.env.example` to `.env`. It is loaded by `dotenv` in `playwright.config.ts`.

## CI

The workflow runs on pushes to `main`, pull requests, manual triggers and a nightly schedule.

| Job                             | Description                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Lint & types                    | ESLint, Prettier check and `tsc --noEmit`                                                 |
| E2E / chromium, firefox, webkit | Installs the browser, runs the E2E project, uploads a blob report and, on failure, traces |
| API tests                       | Runs the API project                                                                      |
| Report                          | Merges blob reports and publishes the HTML report                                         |
| Slack alert                     | Sends a message when the nightly run fails and a webhook secret is configured             |

The report job deploys to GitHub Pages for `main`. To enable it in a fork:

1. Open Settings, then Pages.
2. Set Build and deployment to GitHub Actions.
3. Push to `main` and wait for the Report job.

Slack alerts are optional. Add `SLACK_WEBHOOK_URL` under Settings, Secrets and variables, Actions. Without it the alert job exits successfully.

## Adding a test

Add the missing action to the page object first:

```ts
// src/pages/checkout.page.ts
async cancel(): Promise<void> {
  await this.cancelButton.click();
}
```

Then add the scenario to the spec:

```ts
// tests/e2e/checkout.spec.ts
test('cancel returns to the cart @regression', async ({ checkoutPage, page }) => {
  await checkoutPage.cancel();

  await expect(page).toHaveURL(/cart\.html/);
});
```

Run it with:

```bash
npx playwright test tests/e2e/checkout.spec.ts --project=chromium -g "cancel returns"
```

## Design notes

- Page objects keep selectors out of specs. The shared header and cart badge live in `base.page.ts`.
- Fixtures provide page objects and the API client, so tests ask only for what they use.
- Login runs once per browser project instead of before every test.
- Tags (`@smoke`, `@regression`, `@contract`) allow running a subset without splitting files.
- API responses are validated with Zod. A status code check alone would not catch a field that changed type.
- There are no fixed delays. Web-first assertions wait for the application state, and CI records a trace on the first retry.

## Limitations

- Both targets are shared public demo services, so an outage can fail the pipeline without a code change.
- API tests create and delete their own bookings, but the data lives on a public server.
- There are no visual or accessibility checks.
- The suite is small enough that sharding is not needed yet.

## License

MIT. See [LICENSE](LICENSE).
