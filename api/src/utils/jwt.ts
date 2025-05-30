import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_ISSUER_LOCAL } from '../config/env';

/**
 * Ensure critical environment variables are set at runtime.
 */
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}
if (!TOKEN_ISSUER_LOCAL) {
  throw new Error('Missing TOKEN_ISSUER_LOCAL environment variable');
}

/**
 * Payload structure for locally-signed tokens.
 */
export interface LocalPayload {
  /** User’s UUID (stored in JWT sub) */
  id: string;
  /** User’s email address */
  email: string;
  /** Roles assigned to the user */
  roles?: string[];
  /** Issuer identifier (should match TOKEN_ISSUER_LOCAL) */
  iss: string;
}

/**
 * Create an HS256 JWT for a local user.
 *
 * @param payload     Partial LocalPayload (excluding iss)
 * @param expiresIn   How long before the token expires (e.g. '15m', '7d')
 * @returns           Signed JWT string
 */
export function signLocalToken(
  payload: Omit<LocalPayload, 'iss'>,
  expiresIn: SignOptions['expiresIn'] = '15m'
): string {
  const opts: SignOptions = { algorithm: 'HS256', expiresIn };
  const tokenPayload = {
    sub: payload.id,
    email: payload.email,
    roles: payload.roles,
    iss: TOKEN_ISSUER_LOCAL! // non-null assertion
  };
  return jwt.sign(tokenPayload, JWT_SECRET!, opts); // non-null assertion
}

/**
 * Verify an HS256 JWT issued by us, returning the decoded LocalPayload.
 *
 * @param token   JWT string from client
 * @throws        JsonWebTokenError if invalid, expired, or issuer mismatch
 */
export function verifyLocalToken(token: string): LocalPayload {
  const decoded = jwt.verify(token, JWT_SECRET!, {
    algorithms: ['HS256'],
    issuer: TOKEN_ISSUER_LOCAL!
  }) as jwt.JwtPayload;

  return {
    id: decoded.sub as string,
    email: decoded.email as string,
    roles: decoded.roles as string[] | undefined,
    iss: decoded.iss as string
  };
}
