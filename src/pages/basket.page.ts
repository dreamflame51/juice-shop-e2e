import type { Locator, Page } from '@playwright/test';

export class BasketPage {
  readonly rows: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.rows = page.locator('mat-row');
    this.checkoutButton = page.locator('#checkoutButton');
  }

  async open(): Promise<void> {
    await this.page.goto('/#/basket');
  }

  row(productName: string): Locator {
    return this.rows.filter({ hasText: productName });
  }

  quantityOf(productName: string): Locator {
    return this.row(productName).locator('.mat-column-quantity');
  }
}
