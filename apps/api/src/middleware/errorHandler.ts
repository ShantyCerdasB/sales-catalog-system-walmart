import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Centralised Express error middleware.
 * – Logs every exception.
 * – Maps Zod and Prisma errors to clean JSON responses.
 * – Falls back to 500 on anything unrecognised.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Always write the full error to the log for later inspection.
  logger.error('Unhandled error', err);

  /* Zod validation failure → 400 */
  if (err instanceof ZodError) {
    res.status(400).json({
      type: 'validation',
      issues: err.flatten(),
    });
    return;
  }

  /* Prisma known errors */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // unique constraint
        res.status(409).json({
          type: 'db_conflict',
          message: `Duplicate value for unique field(s): ${err.meta?.target}`,
        });
        return;
      case 'P2025': // record not found
        res.status(404).json({
          type: 'db_not_found',
          message: 'Requested record does not exist',
        });
        return;
      case 'P2003': // foreign-key violation
        res.status(400).json({
          type: 'db_fk_violation',
          message: 'Foreign key constraint failed',
        });
        return;
    }
  }

  /* Any other error → use current status or default to 500 */
  const code = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(code).json({
    type: 'internal',
    message:
      code === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : (err as Error).message,
  });
};
