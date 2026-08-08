import { test as base, type Page } from '@playwright/test';

import { JuiceShopClient, type AuthSession } from '../api/juice-shop.client';
import { buildUser, type TestUser } from '../data/user.factory';
import { BasketPage } from '../pages/basket.page';
import { LoginPage } from '../pages/login.page';
import { ProductsPage } from '../pages/products.page';
import { RegistrationPage } from '../pages/registration.page';
import { config } from '../utils/config';

interface Fixtures {
  /** Freshly generated, NOT yet registered. */
  testUser: TestUser;
  api: JuiceShopClient;
  /** Registered via the API — use when registration itself is not under test. */
  registeredUser: TestUser;
  session: AuthSession;
  /** Browser page already authenticated as `registeredUser`. */
  authedPage: Page;
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  productsPage: ProductsPage;
  basketPage: BasketPage;
}

export const test = base.extend<Fixtures>({
  context: async ({ context }, use) => {
    await context.addCookies([
      { name: 'cookieconsent_status', value: 'dismiss', url: config.baseURL },
      { name: 'welcomebanner_status', value: 'dismiss', url: config.baseURL },
      { name: 'language', value: 'en', url: config.baseURL },
    ]);
    await context.addInitScript(() => {
      window.localStorage.setItem('welcomebanner_status', 'dismiss');
      window.localStorage.setItem('cookieconsent_status', 'dismiss');
    });
    await use(context);
  },

  testUser: async ({}, use) => {
    await use(buildUser());
  },

  api: async ({ request }, use) => {
    await use(new JuiceShopClient(request));
  },

  registeredUser: async ({ api, testUser }, use) => {
    await api.register(testUser);
    await use(testUser);
  },

  session: async ({ api, registeredUser }, use) => {
    await use(await api.login(registeredUser));
  },

  authedPage: async ({ page, context, session }, use) => {
    await context.addCookies([{ name: 'token', value: session.token, url: config.baseURL }]);
    await context.addInitScript(({ token, basketId }) => {
      window.localStorage.setItem('token', token);
      window.sessionStorage.setItem('bid', String(basketId));
    }, session);
    await page.goto('/');
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  basketPage: async ({ page }, use) => {
    await use(new BasketPage(page));
  },
});

export { expect } from '@playwright/test';
