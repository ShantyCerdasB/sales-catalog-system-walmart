// src/test/jest.setup.ts
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// 1) Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2) Create a Prisma client for tests
export const prisma = new PrismaClient();

// 3) Speed up argon2 in tests
jest.mock('argon2', () => {
  const actual = jest.requireActual('argon2');
  return {
    hash: jest.fn(async () => 'fast-test-hash'),
    verify: jest.fn(async () => true),
    argon2id: actual.argon2id,
  };
});

beforeAll(async () => {
  await prisma.$connect();

  // ————— a) delete everything except our single admin user —————
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  // delete all roles
  await prisma.userRole.deleteMany();

  // delete all users *except* admin-id
  await prisma.user.deleteMany({
    where: {
      id: { not: 'admin-id' }
    }
  });

  // ————— b) ensure admin user + role exist —————
  try {
    await prisma.user.create({
      data: {
        id:           'admin-id',
        username:     'admin',
        passwordHash: 'irrelevant',
        email:        'admin@test.local',
      },
    });
  } catch (e: any) {
    // if it's a unique‐constraint error, just ignore
    if (e.code !== 'P2002') throw e;
  }

  try {
    await prisma.userRole.create({
      data: {
        userId: 'admin-id',
        roleId: 'ADMIN',
      },
    });
  } catch (e: any) {
    if (e.code !== 'P2002') throw e;
  }
});

afterAll(async () => {
  // tear down everything
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany({
    where: { id: { not: 'admin-id' } }
  });
  await prisma.$disconnect();
});
