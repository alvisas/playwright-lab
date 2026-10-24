import { expect, test } from '../../src/fixtures/test';
import { PRODUCTS } from '../../src/data/test-data';

test.describe('Shopping cart', () => {
  test.beforeEach(async ({ loggedInInventoryPage }) => {
    await loggedInInventoryPage.addToCart(PRODUCTS.backpack);
    await loggedInInventoryPage.addToCart(PRODUCTS.bikeLight);
    await loggedInInventoryPage.openCart();
  });

  test('keeps the selected items @smoke', async ({ cartPage }) => {
    await cartPage.expectLoaded();
    await cartPage.expectItems([PRODUCTS.backpack, PRODUCTS.bikeLight]);
    await cartPage.expectCartCount(2);
  });

  test('removes an item and updates the badge @regression', async ({ cartPage }) => {
    await cartPage.remove(PRODUCTS.backpack);

    await cartPage.expectItems([PRODUCTS.bikeLight]);
    await cartPage.expectCartCount(1);
  });

  test('continue shopping returns to the inventory @regression', async ({ cartPage, page }) => {
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('keeps the items after a reload @regression', async ({ cartPage, page }) => {
    await page.reload();

    await cartPage.expectLoaded();
    await cartPage.expectItems([PRODUCTS.backpack, PRODUCTS.bikeLight]);
  });
});
