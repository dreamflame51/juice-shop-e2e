import * as allure from 'allure-js-commons';

import { buildUser } from '../../../src/data/user.factory';
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

  test('Rejects invalid credentials without revealing whether the account exists', async ({
    loginPage,
    registeredUser,
  }) => {
    await allure.label('category', 'Security');
    
    await allure.step('wrong password for a registered account', async () => {
      await loginPage.open();
      await loginPage.login(registeredUser.email, 'definitely-not-the-password');
      await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
    });

    await allure.step('an account that was never registered', async () => {
      const unregistered = buildUser();
      await loginPage.open();
      await loginPage.login(unregistered.email, unregistered.password);
      await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
    });
  });
});
