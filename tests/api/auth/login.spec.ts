import * as allure from 'allure-js-commons';

import { expect, test } from '../../../src/fixtures/test';

test.describe('Auth API', () => {
  test.beforeEach(async () => {
    await allure.epic('Authentication');
  });

  test('@smoke issues a JWT and a basket id for valid credentials', async ({
    api,
    registeredUser,
  }) => {
    await allure.label('category', 'functional');

    const response = await api.loginRaw(registeredUser.email, registeredUser.password);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.authentication.token).toMatch(/^eyJ/);
    expect(body.authentication.umail).toBe(registeredUser.email);
    expect(body.authentication.bid).toBeGreaterThan(0);
  });

  test('rejects a wrong password with 401 and no token', async ({ api, registeredUser }) => {
    await allure.label('category', 'security');

    const response = await api.loginRaw(registeredUser.email, 'wrong-password');

    expect(response.status()).toBe(401);
    expect(await response.text()).not.toContain('eyJ');
  });

  test('is not bypassable via SQL injection in the email field', async ({ api }) => {
    await allure.label('category', 'security');

    // Known Juice Shop vulnerability — this test documents the expected *secure*
    // behaviour and is therefore expected to fail against the vulnerable SUT.
    test.fail();

    const response = await api.loginRaw("' OR 1=1--", 'anything');

    expect(response.status()).toBe(401);
  });
});
