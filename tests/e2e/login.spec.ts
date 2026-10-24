import { expect, test } from '../../src/fixtures/test';
import { CREDENTIALS, INVALID_LOGIN_CASES } from '../../src/data/test-data';

// Login tests need a clean browser, so they ignore the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);

    await inventoryPage.expectLoaded();
  });

  test('locked out user cannot log in @regression', async ({ loginPage, page }) => {
    await loginPage.login(CREDENTIALS.lockedOut.username, CREDENTIALS.lockedOut.password);

    await loginPage.expectError('Sorry, this user has been locked out');
    await expect(page).toHaveURL('/');
  });

  for (const testCase of INVALID_LOGIN_CASES) {
    test(`rejects login with ${testCase.name} @regression`, async ({ loginPage }) => {
      await loginPage.login(testCase.username, testCase.password);

      await loginPage.expectError(testCase.error);
    });
  }
});
