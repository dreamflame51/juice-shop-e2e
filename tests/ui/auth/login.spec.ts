import * as allure from 'allure-js-commons';

import { expect, test } from '../../../src/fixtures/test';

test.describe('Login', () => {
  test.beforeEach(async () => {
    await allure.epic('UI: Authentication');
  });

  test('@smoke A registered user can log in', async ({ page, loginPage, registeredUser }) => {
    await allure.label('category', 'Functional');

    await allure.step('open the login page', () => loginPage.open());
    await allure.step('submit valid credentials', () =>
      loginPage.login(registeredUser.email, registeredUser.password),
    );

    await expect(page).toHaveURL(/#\/search/);
    await expect(page.locator('#navbarAccount')).toBeVisible();
  });

  test('Rejects a wrong password without revealing whether the account exists', async ({
    loginPage,
    registeredUser,
  }) => {
    await allure.label('category', 'Security');

    await loginPage.open();
    await loginPage.login(registeredUser.email, 'definitely-not-the-password');

    await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
  });

  test('Rejects an unknown account with the same generic error', async ({ loginPage, testUser }) => {
    await allure.label('category', 'Security');

    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);

    await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
  });
});
