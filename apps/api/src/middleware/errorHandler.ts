import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Global Express error-handling middleware.
 *  – Logs via Winston.
 *  – Converts Zod and Prisma errors into structured JSON.
 *  – Hides stack traces in production.
 */
export function errorHandler() {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    // 1) Always log full error for diagnostics
    logger.error('Unhandled error', err);

    // 2) Zod validation errors → 400 Bad Request
    if (err instanceof ZodError) {
      return res.status(400).json({
        type: 'validation',
        issues: err.flatten(),
      });
    }

    // 3) Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation → 409 Conflict
      if (err.code === 'P2002') {
        return res.status(409).json({
          type: 'db_conflict',
          message: `Duplicate value for unique field(s): ${err.meta?.target}`,
        });
      }
      // Record not found → 404 Not Found :contentReference[oaicite:1]{index=1}
      if (err.code === 'P2025') {
        return res.status(404).json({
          type: 'db_not_found',
          message: 'Requested record does not exist',
        });
      }
      // Foreign key violation → 400 Bad Request :contentReference[oaicite:2]{index=2}
      if (err.code === 'P2003') {
        return res.status(400).json({
          type: 'db_fk_violation',
          message: 'Foreign key constraint failed',
        });
      }
    }

    // 4) Fallback for all other errors
    const status = res.statusCode >= 400 ? res.statusCode : 500;
    res.status(status).json({
      type: 'internal',
      message:
        status === 500 && process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : (err as Error).message,
    });
  };
}
