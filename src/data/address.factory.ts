import { faker } from '@faker-js/faker';

export interface TestAddress {
  fullName: string;
  mobileNum: string;
  zipCode: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
}

export function buildAddress(): TestAddress {
  return {
    fullName: faker.person.fullName(),
    mobileNum: faker.string.numeric(10),
    zipCode: faker.location.zipCode('#####'),
    streetAddress: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
  };
}
