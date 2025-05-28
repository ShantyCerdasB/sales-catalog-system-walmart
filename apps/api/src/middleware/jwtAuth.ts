import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';


/**
 * Verifies a Bearer JWT and pipes the decoded data onto the request object.
 *
 * • Supports both locally-signed (HS256) and Azure (RS256) tokens.
 * • Populates `req.authProvider` and `req.user` for downstream handlers.
 * • Delegates all failures to the global error handler with a 401 status.
 */
export const jwtAuth =
  () => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
      res.status(401);
      next(new Error('Missing Bearer token'));
      return;
    }

    try {
      const { provider, payload } = await verifyToken(token);

      req.authProvider = provider;
      req.user = payload;

      next();
    } catch (err) {
      res.status(401);
      next(err as Error);
    }
  };
