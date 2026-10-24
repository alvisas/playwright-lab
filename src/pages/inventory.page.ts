import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  async addToCart(productName: string): Promise<void> {
    const item = this.items.filter({ hasText: productName });
    await item.getByRole('button', { name: /add to cart/i }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    const item = this.items.filter({ hasText: productName });
    await item.getByRole('button', { name: /remove/i }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async getPrices(): Promise<number[]> {
    const prices = await this.itemPrices.allInnerTexts();
    return prices.map((price) => Number(price.replace('$', '')));
  }
}
