import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Ensures every request carries a correlation identifier.
 *
 * • Accepts and re-uses an incoming `X-Correlation-ID` header when provided.
 * • Creates a fresh UUID v4 if the header is missing or empty.
 * • Exposes the ID on `req.correlationId`, echoes it back in the response,
 *   and binds a child logger on `req.log` for consistent tracing.
 */
export const correlationId =
  () => (req: Request, res: Response, next: NextFunction): void => {
    const raw = req.get('X-Correlation-ID');
    const id = raw && raw.trim() ? raw : uuidv4();

    req.correlationId = id;
    res.setHeader('X-Correlation-ID', id);

    req.log = logger.child({ correlationId: id });

    next();
  };
