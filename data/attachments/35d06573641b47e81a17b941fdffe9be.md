# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/basket/concurrency.spec.ts >> Basket concurrency >> @smoke Concurrent adds of the same product are not lost
- Location: tests/api/basket/concurrency.spec.ts:14:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1  | import * as allure from 'allure-js-commons';
  2  | 
  3  | import { expect, test } from '../../../src/fixtures/test';
  4  | 
  5  | const APPLE_JUICE_ID = 1;
  6  | const CONCURRENT_ADDS = 5;
  7  | 
  8  | test.describe('Basket concurrency', () => {
  9  |   test.beforeEach(async () => {
  10 |     await allure.epic('API: Shopping');
  11 |     await allure.label('category', 'Functional');
  12 |   });
  13 | 
  14 |   test('@smoke Concurrent adds of the same product are not lost', async ({ api, session }) => {
  15 |     // Known Juice Shop concurrency bug: concurrent POST /api/BasketItems/ calls
  16 |     // for the same product race on the "does a row for this product already
  17 |     // exist" check, so all but one lose the race and 500 instead of
  18 |     // incrementing quantity. This documents the expected *correct* behaviour
  19 |     // — every request succeeds and quantities sum — and is therefore expected
  20 |     // to fail against the vulnerable SUT.
  21 |     test.fail();
  22 | 
  23 |     const responses = await Promise.all(
  24 |       Array.from({ length: CONCURRENT_ADDS }, () => api.addToBasketRaw(session.basketId, APPLE_JUICE_ID, 1)),
  25 |     );
> 26 |     expect(responses.every((response) => response.status() === 200)).toBe(true);
     |                                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  27 | 
  28 |     const products = await api.getBasket(session.basketId);
  29 |     const totalQuantity = products.reduce((sum, product) => sum + product.BasketItem.quantity, 0);
  30 |     expect(totalQuantity).toBe(CONCURRENT_ADDS);
  31 |   });
  32 | });
  33 | 
```