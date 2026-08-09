import type { Locator, Page } from '@playwright/test';

export class ProductsPage {
  readonly productCards: Locator;
  readonly snackbar: Locator;
  readonly basketButton: Locator;
  readonly searchToggle: Locator;
  readonly searchInput: Locator;
  readonly noResultsMessage: Locator;

  constructor(private readonly page: Page) {
    this.productCards = page.locator('mat-card');
    this.snackbar = page.locator('.mat-simple-snack-bar-content');
    this.basketButton = page.getByRole('button', { name: 'Show the shopping cart' });
    this.searchToggle = page.locator('.mat-search_icon-search');
    this.searchInput = page.locator('.mat-search_field input');
    this.noResultsMessage = page.getByText('No results found');
  }

  async open(): Promise<void> {
    await this.page.goto('/#/search');
  }

  productCard(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }

  async addToBasket(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: /add to basket/i }).click();
  }

  async openBasket(): Promise<void> {
    await this.basketButton.click();
  }

  async search(term: string): Promise<void> {
    await this.searchToggle.click();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }
}
