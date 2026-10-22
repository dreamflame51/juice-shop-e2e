# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/auth/login.spec.ts >> Auth API >> Is not bypassable via SQL injection in the email field
- Location: tests/api/auth/login.spec.ts:34:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 200
```

# Test source

```ts
  1  | import * as allure from 'allure-js-commons';
  2  | 
  3  | import { expect, test } from '../../../src/fixtures/test';
  4  | 
  5  | test.describe('Auth API', () => {
  6  |   test.beforeEach(async () => {
  7  |     await allure.epic('API: Authentication');
  8  |   });
  9  | 
  10 |   test('@smoke Issues a JWT and a basket id for valid credentials', async ({
  11 |     api,
  12 |     registeredUser,
  13 |   }) => {
  14 |     await allure.label('category', 'Functional');
  15 | 
  16 |     const response = await api.loginRaw(registeredUser.email, registeredUser.password);
  17 | 
  18 |     expect(response.status()).toBe(200);
  19 |     const body = await response.json();
  20 |     expect(body.authentication.token).toMatch(/^eyJ/);
  21 |     expect(body.authentication.umail).toBe(registeredUser.email);
  22 |     expect(body.authentication.bid).toBeGreaterThan(0);
  23 |   });
  24 | 
  25 |   test('Rejects a wrong password with 401 and no token', async ({ api, registeredUser }) => {
  26 |     await allure.label('category', 'Security');
  27 | 
  28 |     const response = await api.loginRaw(registeredUser.email, 'wrong-password');
  29 | 
  30 |     expect(response.status()).toBe(401);
  31 |     expect(await response.text()).not.toContain('eyJ');
  32 |   });
  33 | 
  34 |   test('Is not bypassable via SQL injection in the email field', async ({ api }) => {
  35 |     await allure.label('category', 'Security');
  36 | 
  37 |     // Known Juice Shop vulnerability — this test documents the expected *secure*
  38 |     // behaviour and is therefore expected to fail against the vulnerable SUT.
  39 |     test.fail();
  40 | 
  41 |     const response = await api.loginRaw("' OR 1=1--", 'anything');
  42 | 
> 43 |     expect(response.status()).toBe(401);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  44 |   });
  45 | });
  46 | 
```