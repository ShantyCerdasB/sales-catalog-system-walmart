// apps/api/src/middleware/jwtAuth.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken, VerifiedToken } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    /** "local" if signed by this API, "azure" if M365 token. */
    authProvider?: VerifiedToken['provider'];
    /** Typed token payload (differs per provider). */
    user?: VerifiedToken['payload'];
  }
}

/**
 * Express middleware that enforces authenticated requests.
 *
 * 1. Extracts `Bearer <token>` from Authorization header.
 * 2. Calls verifyToken() which transparently handles both local (HS256) and Azure (RS256) tokens.
 * 3. Attaches `req.authProvider` and `req.user` for downstream handlers.
 * 4. On error, calls next(err) so errorHandler formats the JSON response.
 */
export function jwtAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1) Extract Bearer token
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

    if (!token) {
      // Missing token → set status and delegate to errorHandler
      res.status(401);
      return next(new Error('Missing Bearer token'));
    }

    try {
      // 2) Verify either HS256 or RS256 under the hood
      const { provider, payload } = await verifyToken(token);
      // 3) Attach to request
      req.authProvider = provider;
      req.user = payload;
      return next();
    } catch (err) {
      // 4) Invalid token → 401 Unauthorized
      res.status(401);
      return next(err as Error);
    }
  };
}
