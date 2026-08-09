import type { Locator, Page } from '@playwright/test';

/** Drives the address -> delivery -> payment -> review checkout wizard. Assumes an address and a card already exist. */
export class CheckoutPage {
  /** Each step shows exactly one radio table; re-queried per step since the route changes between steps. */
  readonly firstOption: Locator;
  /** Accessible name is "Proceed to ..." on every wizard step. */
  readonly continueButton: Locator;
  readonly placeOrderButton: Locator;
  readonly confirmationHeading: Locator;

  constructor(private readonly page: Page) {
    this.firstOption = page.getByRole('radio').first();
    this.continueButton = page.getByRole('button', { name: /^Proceed to/ });
    this.placeOrderButton = page.getByRole('button', { name: 'Complete your purchase' });
    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your purchase!' });
  }

  async selectAddress(): Promise<void> {
    // mat-radio's inner circle overlays the input and intercepts plain clicks.
    await this.firstOption.click({ force: true });
    await this.continueButton.click();
  }

  async selectDeliveryMethod(): Promise<void> {
    await this.firstOption.click({ force: true });
    await this.continueButton.click();
  }

  async selectPayment(): Promise<void> {
    await this.firstOption.click({ force: true });
    await this.continueButton.click();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }
}
