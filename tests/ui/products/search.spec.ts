import * as allure from 'allure-js-commons';

import { expect, test } from '../../../src/fixtures/test';

test.describe('Product search', () => {
  test.beforeEach(async () => {
    await allure.epic('UI: Shopping');
    await allure.label('category', 'Functional');
  });

  test('@smoke Returns only products matching the search term', async ({ productsPage }) => {
    await allure.step('open the catalogue and search for "apple"', async () => {
      await productsPage.open();
      await productsPage.search('apple');
    });

    await expect(productsPage.productCards).toHaveCount(2);
    await expect(productsPage.productCards).toContainText(['Apple Juice', 'Apple Pomace']);
  });

  test('Shows a no-results state for a term that matches nothing', async ({ productsPage }) => {
    await allure.step('search for a term no product matches', async () => {
      await productsPage.open();
      await productsPage.search('zzzzznoresult');
    });

    await expect(productsPage.noResultsMessage).toBeVisible();
  });
});
