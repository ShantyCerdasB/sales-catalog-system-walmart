import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';


dotenv.config();

export const prisma = new PrismaClient();


jest.mock('argon2', () => {
  const actual = jest.requireActual('argon2');
  return {
    hash: jest.fn(async () => 'fast-test-hash'),
    verify: jest.fn(async () => true),
    argon2id: actual.argon2id,
  };
});

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en .env');
  }
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
