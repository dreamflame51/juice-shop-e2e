import * as allure from 'allure-js-commons';

import { expect, test } from '../../../src/fixtures/test';

const APPLE_JUICE_ID = 1;
const CONCURRENT_ADDS = 5;

test.describe('Basket concurrency', () => {
  test.beforeEach(async () => {
    await allure.epic('API: Shopping');
    await allure.label('category', 'Functional');
  });

  test('@smoke Concurrent adds of the same product are not lost', async ({ api, session }) => {
    // Known Juice Shop concurrency bug: concurrent POST /api/BasketItems/ calls
    // for the same product race on the "does a row for this product already
    // exist" check, so all but one lose the race and 500 instead of
    // incrementing quantity. This documents the expected *correct* behaviour
    // — every request succeeds and quantities sum — and is therefore expected
    // to fail against the vulnerable SUT.
    test.fail();

    const responses = await Promise.all(
      Array.from({ length: CONCURRENT_ADDS }, () => api.addToBasketRaw(session.basketId, APPLE_JUICE_ID, 1)),
    );
    expect(responses.every((response) => response.status() === 200)).toBe(true);

    const products = await api.getBasket(session.basketId);
    const totalQuantity = products.reduce((sum, product) => sum + product.BasketItem.quantity, 0);
    expect(totalQuantity).toBe(CONCURRENT_ADDS);
  });
});
