import { Request, Response, NextFunction } from 'express';
import { verifyLocalToken, LocalPayload } from '../utils/jwt';

/**
 * Express middleware to protect routes with Bearer HS256 JWTs.
 *
 * – Checks the Authorization header for “Bearer <token>”
 * – Verifies the token and returns 401 JSON on failure
 * – Attaches the full LocalPayload onto `req.user` for downstream handlers
 */
export const jwtAuth = () => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('[jwtAuth] ', req.method, req.originalUrl);

  const authHeader = req.header('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    // missing header → 401 and stop further processing
    res.status(401).json({ error: 'Missing Bearer token' });
    return;
  }
 
  const token = authHeader.slice(7).trim();
  console.log('[jwtAuth] token=', token);
  try {
    // this returns the full LocalPayload, including `iss`
    const payload: LocalPayload = verifyLocalToken(token);

    // attach entire payload, matching your `User` type
    req.user = payload;

    console.log('[jwtAuth] success, user=', payload.id);
    // continue to the next middleware / route handler
    return next();
  } catch (err) {
    console.log('[jwtAuth] invalid token', err);
    // invalid or expired token → 401 and stop
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};
