import { expect, test } from '../../src/fixtures/test';
import { PRODUCTS } from '../../src/data/test-data';

test.describe('Product inventory', () => {
  test('shows the full product catalogue @smoke', async ({ loggedInInventoryPage }) => {
    await expect(loggedInInventoryPage.items).toHaveCount(6);
    await expect(loggedInInventoryPage.itemNames).toHaveText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ]);
  });

  test('sorts products by price, low to high @regression', async ({ loggedInInventoryPage }) => {
    await loggedInInventoryPage.sortBy('lohi');

    const prices = await loggedInInventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by name, Z to A @regression', async ({ loggedInInventoryPage }) => {
    await loggedInInventoryPage.sortBy('za');

    const names = await loggedInInventoryPage.getNames();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('adds and removes a product from the listing @smoke', async ({ loggedInInventoryPage }) => {
    await loggedInInventoryPage.addToCart(PRODUCTS.backpack);
    await loggedInInventoryPage.expectCartCount(1);

    await loggedInInventoryPage.removeFromCart(PRODUCTS.backpack);
    await loggedInInventoryPage.expectCartCount(0);
  });
});
