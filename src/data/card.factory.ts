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
    expYear: faker.date.future({ years: 5 }).getFullYear(),
  };
}
