import { PRODUCTS } from '../../src/data/test-data';
import { expect, test } from '../../src/fixtures/test';
import { expectNoA11yViolations } from '../../src/helpers/a11y';

test.describe('Login page accessibility', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('has no accessibility violations @a11y', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    await expectNoA11yViolations(page);
  });
});

test.describe('Authenticated pages accessibility', () => {
  test('inventory has no accessibility violations @a11y', async ({
    loggedInInventoryPage,
    page,
  }) => {
    await expect(loggedInInventoryPage.items).toHaveCount(6);

    await expectNoA11yViolations(page);
  });

  test('cart has no accessibility violations @a11y', async ({
    loggedInInventoryPage,
    cartPage,
    page,
  }) => {
    await loggedInInventoryPage.addToCart(PRODUCTS.backpack);
    await loggedInInventoryPage.openCart();
    await cartPage.expectLoaded();

    await expectNoA11yViolations(page);
  });

  test('checkout form has no accessibility violations @a11y', async ({
    loggedInInventoryPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await loggedInInventoryPage.addToCart(PRODUCTS.backpack);
    await loggedInInventoryPage.openCart();
    await cartPage.checkout();
    await expect(checkoutPage.firstNameInput).toBeVisible();

    await expectNoA11yViolations(page);
  });
});
