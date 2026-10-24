import { expect, test } from '../../src/fixtures/test';
import { CUSTOMER, PRODUCTS } from '../../src/data/test-data';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loggedInInventoryPage, cartPage }) => {
    await loggedInInventoryPage.addToCart(PRODUCTS.backpack);
    await loggedInInventoryPage.addToCart(PRODUCTS.onesie);
    await loggedInInventoryPage.openCart();
    await cartPage.checkout();
  });

  test('customer can complete an order @smoke', async ({ checkoutPage, page }) => {
    await test.step('fill in customer details', async () => {
      await checkoutPage.fillCustomerInfo(CUSTOMER);
      await checkoutPage.continue();

      await expect(checkoutPage.subtotalLabel).toBeVisible();
    });

    await test.step('finish the order', async () => {
      await checkoutPage.finish();

      await checkoutPage.expectOrderComplete();
      await expect(page).toHaveURL(/checkout-complete\.html/);
    });
  });

  test('requires the customer first name @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo({ ...CUSTOMER, firstName: '' });
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toContainText('First Name is required');
  });

  test('back from the form returns to the cart @regression', async ({ cartPage, page }) => {
    await page.goBack();

    await cartPage.expectLoaded();
    await cartPage.expectItems([PRODUCTS.backpack, PRODUCTS.onesie]);
  });

  test('order total equals subtotal plus tax @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo(CUSTOMER);
    await checkoutPage.continue();

    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    expect(total).toBeCloseTo(subtotal + tax, 2);
  });
});
