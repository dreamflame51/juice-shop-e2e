import * as allure from 'allure-js-commons';

import { buildAddress } from '../../../src/data/address.factory';
import { buildCard } from '../../../src/data/card.factory';
import { expect, test } from '../../../src/fixtures/test';

const PRODUCT = 'Apple Juice (1000ml)';

test.describe('Checkout', () => {
  test.beforeEach(async () => {
    await allure.epic('UI: Shopping');
    await allure.label('category', 'Functional');
  });

  test('@smoke A user can complete checkout end to end', async ({
    api,
    session,
    authedPage,
    productsPage,
    basketPage,
    checkoutPage,
  }) => {
    await allure.step('seed a delivery address and payment card via the API', () =>
      Promise.all([api.createAddress(buildAddress()), api.createCard(buildCard())]),
    );

    await allure.step('add the product to the basket', async () => {
      await productsPage.open();
      await productsPage.addToBasket(PRODUCT);
    });
    await expect(productsPage.snackbar).toContainText(/placed .* into basket/i);

    await allure.step('go to checkout', async () => {
      await basketPage.open();
      await basketPage.checkoutButton.click();
    });

    await allure.step('select the delivery address', () => checkoutPage.selectAddress());
    await allure.step('select the delivery method', () => checkoutPage.selectDeliveryMethod());
    await allure.step('select the payment method', () => checkoutPage.selectPayment());
    await allure.step('place the order', () => checkoutPage.placeOrder());

    await expect(checkoutPage.confirmationHeading).toBeVisible();
    await expect(authedPage).toHaveURL(/#\/order-completion\/[0-9a-f-]+$/);
  });
});
