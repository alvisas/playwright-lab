# Playwright Lab

[![Playwright CI](https://github.com/alvisas/playwright-lab/actions/workflows/playwright.yml/badge.svg)](https://github.com/alvisas/playwright-lab/actions/workflows/playwright.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Playwright and TypeScript test suite for two public demo applications: the shopping flow on saucedemo.com and the booking lifecycle on restful-booker.

The end-to-end tests cover login, inventory, cart and checkout in Chromium, Firefox and WebKit. The API tests exercise the booking CRUD lifecycle, authentication and error responses. Both targets are free demo services, so the repository runs without credentials, API keys or a staging server.

The HTML report from the latest run on `main` is published to [GitHub Pages](https://alvisas.github.io/playwright-lab/).

## What it covers

| Area          | Scenarios                                                                             |
| ------------- | ------------------------------------------------------------------------------------- |
| Login         | valid login, locked-out user, invalid credentials, protected page without a session   |
| Inventory     | full catalogue, price sorting, name sorting, add and remove                           |
| Cart          | items persist, items survive a reload, badge updates after removal, continue shopping |
| Checkout      | complete order, required first name, subtotal plus tax equals total, back to the cart |
| Booking API   | health check, id list, create/read/update/delete, invalid token, missing booking      |
| Contracts     | Zod schemas for booking, token and error responses                                    |
| Accessibility | axe on login, inventory, cart and checkout, Chromium only                             |
| Mobile        | five `@smoke` scenarios on a Pixel 7 viewport                                         |

A full run is 74 tests: 18 end-to-end scenarios in three browsers, 4 accessibility checks in Chromium, 5 smoke scenarios on a mobile viewport, one login setup, and 10 API tests.

## Running locally

Requires Node.js 22 or newer.

```bash
git clone https://github.com/alvisas/playwright-lab.git
cd playwright-lab
npm install
npx playwright install
npm test
```

The scripts I use most:

```bash
npm test              # all projects
npm run test:e2e      # Chromium only
npm run test:api      # API project
npm run test:mobile   # smoke tests on a Pixel 7 viewport
npm run test:a11y     # axe checks
npm run test:smoke    # tests tagged @smoke
npm run test:ui       # Playwright UI mode
npm run report        # open the last HTML report
```

`npm run lint`, `npm run format:check` and `npm run typecheck` are the checks CI runs on every push.

## How the suite is organised

```
src/
  api/        request client for restful-booker
  data/       credentials, product names, booking factory
  fixtures/   page objects and API client injected into tests
  helpers/    axe wrapper with the two known rules disabled
  pages/      one page object per screen
  schemas/    Zod contracts for API responses
tests/
  auth.setup.ts   logs in once and saves the session
  api/            booking lifecycle and contract tests
  e2e/            login, inventory, cart, checkout, accessibility
```

Specs in `tests` describe scenarios and assertions. Selectors and page actions live in `src/pages`, and specs receive the page objects and the API client as fixtures instead of building them. Locators go through `getByTestId`, which keeps them stable when copy or layout changes.

The API side has two fixtures of its own: a token created once per worker, and a `createBooking` helper that deletes every booking it created when the test ends, including after a failure.

`tests/auth.setup.ts` signs in once and writes the storage state to `playwright/.auth/standard-user.json`. The browser projects start from that file, so the login flow runs a single time per run. The login spec opts out with an empty `storageState` because those tests need a clean session.

Assertions use Playwright's web-first matchers, so there are no fixed sleeps. CI retries a failed test twice and keeps the trace, screenshot and video.

Accessibility checks use axe through `src/helpers/a11y.ts`. They run in Chromium only. Two rules that the demo app already fails are disabled, so only new violations fail the check.

Tags (`@smoke`, `@regression`, `@contract`, `@a11y`) keep related cases in the same file while letting you run a subset.

## Configuration

`src/config.ts` reads the base URLs from environment variables and falls back to the public demo sites. Accounts and product names live in `src/data/test-data.ts`, which takes the same overrides. Copy `.env.example` to `.env` to point the suite somewhere else:

```bash
E2E_BASE_URL=https://staging.example.com
API_BASE_URL=https://api.staging.example.com
```

The same file accepts `E2E_USERNAME`, `E2E_PASSWORD`, `API_USERNAME` and `API_PASSWORD`.

## Continuous integration

Every push to `main` and every pull request runs lint, Prettier check and typecheck in one job, the E2E project in three browser jobs, the smoke set in a Pixel 7 job, and the API project in another. Each job uploads a blob report. A final job merges them, publishes the HTML report to GitHub Pages, and keeps traces as artifacts when a job fails. Because the setup project runs on Chromium, every browser job installs Chromium alongside its matrix browser.

A nightly run at 01:00 UTC catches breakage in the demo services when the repository is otherwise idle. If it fails and `SLACK_WEBHOOK_URL` is set as a repository secret, the workflow posts the run URL to Slack. Without the secret the job exits quietly.

To publish the report from a fork, set Pages to deploy from GitHub Actions under Settings, then Pages.

## Adding a test

Page objects own the locators, so a new interaction is one method. Cancelling from the checkout form, for example:

```ts
// src/pages/checkout.page.ts
async cancel(): Promise<void> {
  await this.cancelButton.click();
}
```

Then the scenario uses it:

```ts
// tests/e2e/checkout.spec.ts
test('cancel returns to the cart @regression', async ({ checkoutPage, page }) => {
  await checkoutPage.cancel();
  await expect(page).toHaveURL(/cart\.html/);
});
```

Run just that test with `npx playwright test tests/e2e/checkout.spec.ts --project=chromium -g "cancel returns"`.

## Notes

Both targets are public demo services, so an outage can fail the pipeline without a code change. The API tests delete the bookings they create, but the data still lives on a shared server. There are no visual regression checks; the demo pages render differently across operating systems, so screenshots would fail more often than they would catch anything. The suite is small enough that sharding would add more moving parts than it saves.

## License

MIT. See [LICENSE](LICENSE).
