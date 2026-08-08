import type { Locator, Page } from '@playwright/test';

import type { TestUser } from '../data/user.factory';
import { clickUntilVisible } from '../utils/wait';

export class RegistrationPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly repeatPassword: Locator;
  readonly securityQuestion: Locator;
  readonly securityQuestionLabel: Locator;
  readonly securityQuestionOptions: Locator;
  readonly securityAnswer: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.email = page.locator('#emailControl');
    this.password = page.locator('#passwordControl');
    this.repeatPassword = page.locator('#repeatPasswordControl');
    this.securityQuestion = page.locator('mat-select[name="securityQuestion"]');
    this.securityQuestionLabel = page.locator(
      'mat-form-field:has(mat-select[name="securityQuestion"]) mat-label',
    );
    this.securityQuestionOptions = page.locator('mat-option');
    this.securityAnswer = page.locator('#securityAnswerControl');
    this.submitButton = page.locator('#registerButton');
  }

  async open(): Promise<void> {
    await this.page.goto('/#/register');
  }

  async selectFirstSecurityQuestion(): Promise<void> {
    const firstOption = this.securityQuestionOptions.first();
    await clickUntilVisible(this.securityQuestionLabel, firstOption);
    await firstOption.click();
  }

  async register(user: TestUser): Promise<void> {
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.repeatPassword.fill(user.password);
    await this.selectFirstSecurityQuestion();
    await this.securityAnswer.fill(user.securityAnswer);
    await this.submitButton.click();
  }
}
