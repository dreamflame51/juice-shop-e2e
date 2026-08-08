import { config as loadEnv } from 'dotenv';

loadEnv();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable "${key}". Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const config = {
  baseURL: required('BASE_URL'),
  testUserPassword: required('TEST_USER_PASSWORD'),
} as const;
