# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/basket/isolation.spec.ts >> Basket isolation between users >> Does not let another user read a victim's basket contents
- Location: tests/api/basket/isolation.spec.ts:28:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 403
Received: 200
```

# Test source

```ts
  1  | import * as allure from 'allure-js-commons';
  2  | 
  3  | import { JuiceShopClient } from '../../../src/api/juice-shop.client';
  4  | import { buildAddress } from '../../../src/data/address.factory';
  5  | import { buildCard } from '../../../src/data/card.factory';
  6  | import { buildUser } from '../../../src/data/user.factory';
  7  | import { expect, test } from '../../../src/fixtures/test';
  8  | 
  9  | const APPLE_JUICE_ID = 1;
  10 | 
  11 | test.describe('Basket isolation between users', () => {
  12 |   test.beforeEach(async () => {
  13 |     await allure.epic('API: Shopping');
  14 |     await allure.label('category', 'Security');
  15 |   });
  16 | 
  17 |   test("Rejects adding items to another user's basket", async ({ session, request }) => {
  18 |     const attackerUser = buildUser();
  19 |     const attacker = new JuiceShopClient(request);
  20 |     await attacker.register(attackerUser);
  21 |     await attacker.login(attackerUser);
  22 | 
  23 |     const response = await attacker.addToBasketRaw(session.basketId, APPLE_JUICE_ID, 1);
  24 | 
  25 |     expect(response.status()).toBe(401);
  26 |   });
  27 | 
  28 |   test("Does not let another user read a victim's basket contents", async ({ api, session, request }) => {
  29 |     await allure.step("victim adds an item to their own basket", () =>
  30 |       api.addToBasket(session.basketId, APPLE_JUICE_ID, 1),
  31 |     );
  32 | 
  33 |     const attackerUser = buildUser();
  34 |     const attacker = new JuiceShopClient(request);
  35 |     await attacker.register(attackerUser);
  36 |     await attacker.login(attackerUser);
  37 | 
  38 |     // Known Juice Shop vulnerability (missing ownership check on GET
  39 |     // /rest/basket/:id) — this documents the expected *secure* behaviour and
  40 |     // is therefore expected to fail against the vulnerable SUT.
  41 |     test.fail();
  42 | 
  43 |     const response = await attacker.getBasketRaw(session.basketId);
  44 | 
> 45 |     expect(response.status()).toBe(403);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  46 |   });
  47 | 
  48 |   test("Does not let another user check out a victim's basket", async ({ api, session, request }) => {
  49 |     await allure.step("victim adds an item to their own basket", () =>
  50 |       api.addToBasket(session.basketId, APPLE_JUICE_ID, 1),
  51 |     );
  52 | 
  53 |     const attackerUser = buildUser();
  54 |     const attacker = new JuiceShopClient(request);
  55 |     await attacker.register(attackerUser);
  56 |     await attacker.login(attackerUser);
  57 |     const [addressId, paymentId] = await allure.step('attacker creates their own address and card', () =>
  58 |       Promise.all([attacker.createAddress(buildAddress()), attacker.createCard(buildCard())]),
  59 |     );
  60 | 
  61 |     // Known Juice Shop vulnerability (missing ownership check on POST
  62 |     // /rest/basket/:id/checkout) — this documents the expected *secure*
  63 |     // behaviour and is therefore expected to fail against the vulnerable SUT.
  64 |     test.fail();
  65 | 
  66 |     const response = await attacker.checkoutRaw(session.basketId, { addressId, paymentId, deliveryMethodId: 3 });
  67 | 
  68 |     expect(response.status()).toBe(403);
  69 |   });
  70 | });
  71 | 
```