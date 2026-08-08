import * as allure from "allure-js-commons";

import { expect, test } from "../../../src/fixtures/test";

test.describe("Registration", () => {
  test.beforeEach(async () => {
    await allure.epic("UI: Authentication");
    await allure.label("category", "Functional");
  });

  test("@smoke A new customer can register and then log in", async ({
    page,
    registrationPage,
    loginPage,
    testUser,
  }) => {
    await allure.step("register a brand new customer", async () => {
      await registrationPage.open();
      await registrationPage.register(testUser);
    });

    await expect(page).toHaveURL(/#\/login/);

    await allure.step("log in with the credentials just registered", () =>
      loginPage.login(testUser.email, testUser.password),
    );

    await expect(page).toHaveURL(/#\/search/);
  });

  test("Blocks submission when the repeated password does not match", async ({
    registrationPage,
    testUser,
  }) => {
    await registrationPage.open();
    await registrationPage.email.fill(testUser.email);
    await registrationPage.password.fill(testUser.password);
    await registrationPage.repeatPassword.fill(`${testUser.password}-mismatch`);
    await registrationPage.securityAnswer.click();

    await expect(registrationPage.submitButton).toBeDisabled();
  });
});
