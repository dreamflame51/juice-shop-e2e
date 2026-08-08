import { faker } from '@faker-js/faker';

import { config } from '../utils/config';

export interface TestUser {
  email: string;
  password: string;
  securityAnswer: string;
}

/** Unique per call so parallel workers never collide on a registered email. */
export function buildUser(): TestUser {
  return {
    email: `${faker.internet.username()}.${faker.string.alphanumeric(8)}@e2e.test`.toLowerCase(),
    password: config.testUserPassword,
    securityAnswer: faker.animal.petName(),
  };
}
