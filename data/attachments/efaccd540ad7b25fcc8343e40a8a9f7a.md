# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui/basket/add-to-basket.spec.ts >> Basket >> @smoke an authenticated user can add a product to the basket
- Location: tests/ui/basket/add-to-basket.spec.ts:13:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[matsnackbarlabel]')
Expected pattern: /placed .* into basket/i
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('[matsnackbarlabel]')

```

```yaml
- button "Open Sidenav"
- button "Back to homepage":
  - img "OWASP Juice Shop"
  - text: OWASP Juice Shop
- textbox
- button "Show/hide account menu": account_circle Account
- button "Show the shopping cart": Your Basket 1
- button "Language selection menu": EN
- text: All Products
- button "Apple Juice (1000ml)"
- text: Apple Juice (1000ml) 1.99¤
- button "Add to Basket"
- button "Apple Pomace"
- text: Apple Pomace 0.89¤
- button "Add to Basket"
- button "Banana Juice (1000ml)"
- text: Banana Juice (1000ml) 1.99¤
- button "Add to Basket"
- text: Only 1 left
- button "Best Juice Shop Salesman Artwork"
- text: Best Juice Shop Salesman Artwork 5000¤
- button "Add to Basket"
- button "Carrot Juice (1000ml)"
- text: Carrot Juice (1000ml) 2.99¤
- button "Add to Basket"
- button "DSOMM & Juice Shop User Day Ticket"
- text: DSOMM & Juice Shop User Day Ticket 55.2¤
- button "Add to Basket"
- button "Eggfruit Juice (500ml)"
- text: Eggfruit Juice (500ml) 8.99¤
- button "Add to Basket"
- button "Fruit Press"
- text: Fruit Press 89.99¤
- button "Add to Basket"
- button "Green Smoothie"
- text: Green Smoothie 1.99¤
- button "Add to Basket"
- text: Only 1 left
- button "Juice Shop \"Permafrost\" 2020 Edition"
- text: Juice Shop "Permafrost" 2020 Edition 9999.99¤
- button "Add to Basket"
- button "Lemon Juice (500ml)"
- text: Lemon Juice (500ml) 2.99¤
- button "Add to Basket"
- text: Only 3 left
- button "Melon Bike (Comeback-Product 2018 Edition)"
- text: Melon Bike (Comeback-Product 2018 Edition) 2999¤
- button "Add to Basket"
- separator
- group:
  - text: "Items per page:"
  - combobox "Items per page:": "12"
  - text: 1 – 12 of 37
  - button "Previous page" [disabled]:
    - img
  - button "Next page":
    - img
```

# Test source

```ts
  1  | import * as allure from 'allure-js-commons';
  2  | 
  3  | import { expect, test } from '../../../src/fixtures/test';
  4  | 
  5  | const PRODUCT = 'Apple Juice (1000ml)';
  6  | 
  7  | test.describe('Basket', () => {
  8  |   test.beforeEach(async () => {
  9  |     await allure.epic('Shopping');
  10 |     await allure.label('category', 'functional');
  11 |   });
  12 | 
  13 |   test('@smoke an authenticated user can add a product to the basket', async ({
  14 |     authedPage,
  15 |     productsPage,
  16 |     basketPage,
  17 |   }) => {
  18 |     await allure.step('add the product from the catalogue', async () => {
  19 |       await productsPage.open();
  20 |       await productsPage.addToBasket(PRODUCT);
  21 |     });
  22 | 
> 23 |     await expect(productsPage.snackbar).toContainText(/placed .* into basket/i);
     |                                         ^ Error: expect(locator).toContainText(expected) failed
  24 | 
  25 |     await allure.step('open the basket', () => basketPage.open());
  26 | 
  27 |     await expect(basketPage.row(PRODUCT)).toBeVisible();
  28 |     await expect(basketPage.quantityOf(PRODUCT)).toHaveText(/1/);
  29 |     await expect(basketPage.checkoutButton).toBeEnabled();
  30 |   });
  31 | 
  32 |   test('basket seeded through the API is reflected in the UI', async ({
  33 |     api,
  34 |     session,
  35 |     authedPage,
  36 |     basketPage,
  37 |   }) => {
  38 |     await allure.step('seed two units via the API', () =>
  39 |       api.addToBasket(session.basketId, 1, 2),
  40 |     );
  41 | 
  42 |     await basketPage.open();
  43 | 
  44 |     await expect(basketPage.quantityOf(PRODUCT)).toHaveText(/2/);
  45 |   });
  46 | });
  47 | 
```