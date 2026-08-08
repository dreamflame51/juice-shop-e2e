import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;

  constructor(private readonly page: Page) {
    this.email = page.locator('#email');
    this.password = page.locator('#password');
    this.submitButton = page.locator('#loginButton');
    this.errorMessage = page.locator('.error');
    this.registerLink = page.locator('#newCustomerLink');
  }

  async open(): Promise<void> {
    await this.page.goto('/#/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
