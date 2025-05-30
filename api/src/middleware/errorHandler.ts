import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Centralised Express error middleware.
 * – Logs every exception.
 * – Maps validation, ORM, and business errors to appropriate JSON responses.
 * – Falls back to 500 on anything unrecognised.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log the full error for debugging
  logger.error('Unhandled error', err);

  // Business error: invalid credentials
  if ((err as Error).message === 'invalid') {
    return res.status(401).json({
      type: 'auth_error',
      message: 'Invalid username or password',
    });
  }

  // Business error: duplicate signup
  if ((err as Error).message === 'duplicate') {
    return res.status(409).json({
      type: 'conflict',
      message: 'Username or email already in use',
    });
  }

  // Zod validation failure -> 400
  if (err instanceof ZodError) {
    return res.status(400).json({
      type: 'validation',
      issues: err.flatten(),
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // unique constraint violation
        return res.status(409).json({
          type: 'db_conflict',
          message: `Duplicate value for field(s): ${err.meta?.target}`,
        });
      case 'P2025': // record not found
        return res.status(404).json({
          type: 'db_not_found',
          message: 'Requested record does not exist',
        });
      case 'P2003': // foreign-key violation
        return res.status(400).json({
          type: 'db_fk_violation',
          message: 'Foreign key constraint failed',
        });
    }
  }

  // Fallback: use existing status or default to 500
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  return res.status(status).json({
    type: status === 500 ? 'internal' : 'error',
    message:
      status === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : (err as Error).message,
  });
};
