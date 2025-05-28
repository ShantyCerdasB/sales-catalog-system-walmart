/* ────────────────────────────────  prisma.ts  ──────────────────────────────
 * Singleton Prisma client. Import this file wherever you need DB access:
 *
 *     import { prisma } from '../prisma';
 *
 * The instance is created once and reused, avoiding the “too many open
 * connections” problem in dev hot-reload.
 * ------------------------------------------------------------------------ */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/* Optional graceful shutdown (called from index.ts) */
export async function closePrisma() {
  await prisma.$disconnect();
}
