import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Correlation ID middleware.
 *
 * – Generates or reads an `X-Correlation-ID` header on each request.
 * – Attaches it to `req.correlationId` and adds to every log entry.
 */
declare module 'express-serve-static-core' {
  interface Request {
    correlationId?: string;
  }
}

export function correlationId() {
  return (req: Request, _res: Response, next: NextFunction) => {
    // 1) Read incoming header or generate a new UUID
    const incoming = req.header('X-Correlation-ID');
    const id = typeof incoming === 'string' && incoming.trim().length > 0
      ? incoming
      : uuidv4();

    // 2) Attach to request and response headers
    req.correlationId = id;
    _res.setHeader('X-Correlation-ID', id);

    // 3) Bind logger to include correlation ID
    req.log = logger.child({ correlationId: id });

    next();
  };
}
