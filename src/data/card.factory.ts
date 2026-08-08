import { faker } from '@faker-js/faker';

export interface TestCard {
  fullName: string;
  cardNum: string;
  expMonth: number;
  expYear: number;
}

export function buildCard(): TestCard {
  return {
    fullName: faker.person.fullName(),
    cardNum: faker.finance.creditCardNumber('4###########1111').replace(/\D/g, ''),
    expMonth: faker.number.int({ min: 1, max: 12 }),
    // Juice Shop hardcodes a minimum expYear of 2080 server-side (unrelated to
    // the current date) — see tests/perf/checkout.js which relies on the same value.
    expYear: faker.number.int({ min: 2080, max: 2099 }),
  };
}
