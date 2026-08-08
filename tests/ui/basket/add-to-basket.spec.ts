import * as allure from 'allure-js-commons';

import { expect, test } from '../../../src/fixtures/test';

const PRODUCT = 'Apple Juice (1000ml)';

test.describe('Basket', () => {
  test.beforeEach(async () => {
    await allure.epic('Shopping');
    await allure.label('category', 'functional');
  });

  test('@smoke an authenticated user can add a product to the basket', async ({
    authedPage,
    productsPage,
    basketPage,
  }) => {
    await allure.step('add the product from the catalogue', async () => {
      await productsPage.open();
      await productsPage.addToBasket(PRODUCT);
    });

    await expect(productsPage.snackbar).toContainText(/placed .* into basket/i);

    await allure.step('open the basket', () => basketPage.open());

    await expect(basketPage.row(PRODUCT)).toBeVisible();
    await expect(basketPage.quantityOf(PRODUCT)).toHaveText(/1/);
    await expect(basketPage.checkoutButton).toBeEnabled();
  });

  test('basket seeded through the API is reflected in the UI', async ({
    api,
    session,
    authedPage,
    basketPage,
  }) => {
    await allure.step('seed two units via the API', () =>
      api.addToBasket(session.basketId, 1, 2),
    );

    await basketPage.open();

    await expect(basketPage.quantityOf(PRODUCT)).toHaveText(/2/);
  });
});
