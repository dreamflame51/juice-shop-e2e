import * as allure from 'allure-js-commons';

import { JuiceShopClient } from '../../../src/api/juice-shop.client';
import { buildAddress } from '../../../src/data/address.factory';
import { buildCard } from '../../../src/data/card.factory';
import { buildUser } from '../../../src/data/user.factory';
import { expect, test } from '../../../src/fixtures/test';

const APPLE_JUICE_ID = 1;

test.describe('Basket isolation between users', () => {
  test.beforeEach(async () => {
    await allure.epic('API: Shopping');
    await allure.label('category', 'Security');
  });

  test("Rejects adding items to another user's basket", async ({ session, request }) => {
    const attackerUser = buildUser();
    const attacker = new JuiceShopClient(request);
    await attacker.register(attackerUser);
    await attacker.login(attackerUser);

    const response = await attacker.addToBasketRaw(session.basketId, APPLE_JUICE_ID, 1);

    expect(response.status()).toBe(401);
  });

  test("Does not let another user read a victim's basket contents", async ({ api, session, request }) => {
    await allure.step("victim adds an item to their own basket", () =>
      api.addToBasket(session.basketId, APPLE_JUICE_ID, 1),
    );

    const attackerUser = buildUser();
    const attacker = new JuiceShopClient(request);
    await attacker.register(attackerUser);
    await attacker.login(attackerUser);

    // Known Juice Shop vulnerability (missing ownership check on GET
    // /rest/basket/:id) — this documents the expected *secure* behaviour and
    // is therefore expected to fail against the vulnerable SUT.
    test.fail();

    const response = await attacker.getBasketRaw(session.basketId);

    expect(response.status()).toBe(403);
  });

  test("Does not let another user check out a victim's basket", async ({ api, session, request }) => {
    await allure.step("victim adds an item to their own basket", () =>
      api.addToBasket(session.basketId, APPLE_JUICE_ID, 1),
    );

    const attackerUser = buildUser();
    const attacker = new JuiceShopClient(request);
    await attacker.register(attackerUser);
    await attacker.login(attackerUser);
    const [addressId, paymentId] = await allure.step('attacker creates their own address and card', () =>
      Promise.all([attacker.createAddress(buildAddress()), attacker.createCard(buildCard())]),
    );

    // Known Juice Shop vulnerability (missing ownership check on POST
    // /rest/basket/:id/checkout) — this documents the expected *secure*
    // behaviour and is therefore expected to fail against the vulnerable SUT.
    test.fail();

    const response = await attacker.checkoutRaw(session.basketId, { addressId, paymentId, deliveryMethodId: 3 });

    expect(response.status()).toBe(403);
  });
});
