import * as allure from 'allure-js-commons';

import { buildAddress } from '../../../src/data/address.factory';
import { buildCard } from '../../../src/data/card.factory';
import { expect, test } from '../../../src/fixtures/test';

const APPLE_JUICE_ID = 1;

test.describe('Checkout API', () => {
  test.beforeEach(async () => {
    await allure.epic('API: Shopping');
    await allure.label('category', 'Performance');
  });

  test('@smoke Completes an order end to end and returns a confirmation', async ({ api, session }) => {
    await allure.step('add a product to the basket', () =>
      api.addToBasket(session.basketId, APPLE_JUICE_ID, 2),
    );

    const products = await api.getBasket(session.basketId);
    expect(products).toHaveLength(1);
    expect(products[0].BasketItem.quantity).toBe(2);

    const [addressId, paymentId] = await allure.step('create address and card', () =>
      Promise.all([api.createAddress(buildAddress()), api.createCard(buildCard())]),
    );

    const confirmation = await allure.step('check out', () =>
      api.checkout(session.basketId, { addressId, paymentId, deliveryMethodId: 3 }),
    );

    expect(confirmation).toMatch(/^[0-9a-f]{4}-[0-9a-f]+$/);
  });

  test('Empties the basket once the order is placed', async ({ api, session }) => {
    await allure.label('category', 'Functional');

    await api.addToBasket(session.basketId, APPLE_JUICE_ID, 1);
    const [addressId, paymentId] = await Promise.all([
      api.createAddress(buildAddress()),
      api.createCard(buildCard()),
    ]);
    await api.checkout(session.basketId, { addressId, paymentId, deliveryMethodId: 3 });

    expect(await api.getBasket(session.basketId)).toHaveLength(0);
  });
});
