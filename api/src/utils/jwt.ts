import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_ISSUER_LOCAL } from '../config/env';

/**
 * Payload structure for locally-signed tokens.
 */
export interface LocalPayload {
  /** User’s UUID (stored in JWT sub) */
  id: string;
  /** User’s email address */
  email: string;
  roles?: string[];
  /** Issuer identifier, always equals TOKEN_ISSUER_LOCAL */
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
  // Map `id` to JWT `sub`, and inject our issuer claim
  const tokenPayload = { sub: payload.id, email: payload.email, roles: payload.roles, iss: TOKEN_ISSUER_LOCAL };
  return jwt.sign(tokenPayload, JWT_SECRET, opts);
}

/**
 * Verify an HS256 JWT issued by us, returning the decoded LocalPayload.
 *
 * @param token   JWT string from client
 * @throws        JsonWebTokenError if invalid or expired, or if issuer mismatch
 */
export function verifyLocalToken(token: string): LocalPayload {
  const decoded = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: TOKEN_ISSUER_LOCAL,
  }) as jwt.JwtPayload;

  return {
    id:    decoded.sub as string,
    email: decoded.email as string,
    roles: decoded.roles as string[] | undefined,
    iss:   decoded.iss as string,
  };
}
