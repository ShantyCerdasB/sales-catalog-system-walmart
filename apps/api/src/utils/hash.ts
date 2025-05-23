/* ─────────────────────────────── utils/jwt.ts ──────────────────────────────
 * JWT helper utilities for a hybrid auth model:
 *
 *   • “Local” users  →  HS256-signed tokens issued by the API itself.
 *   • M365 users     →  RS256-signed ID/Access tokens issued by Azure AD.
 *
 * The file exposes:
 *   • signLocalToken()        → Issues HS256 tokens for local accounts.
 *   • verifyToken()           → Single entry-point that transparently
 *                               validates either kind of token and returns
 *                               { provider, payload }.
 * ------------------------------------------------------------------------ */

import jwt, { JwtHeader, SignOptions, VerifyErrors } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import {
  JWT_SECRET,
  TOKEN_ISSUER_LOCAL,
  B2C_TENANT_ID,
  B2C_CLIENT_ID,
} from '../config/env';

/* ------------------------------------------------------------------------ */
/* A)  Local (HS256) token signing + verification                            */
/* ------------------------------------------------------------------------ */

/** Payload we embed in *locally*-issued tokens. */
export interface LocalPayload {
  sub: string;          // user ID in our database
  email: string;
  roles?: string[];
  iss: string;          // constant identifier of this API
}

/**
 * Create a HS256 JWT for a local account.
 *
 * @param payload   All claims except `iss`, which is added automatically.
 * @param expiresIn Default `"15m"`. Accepts `"2h"`, `60 * 60`, etc.
 */
export function signLocalToken(
  payload: Omit<LocalPayload, 'iss'>,
  expiresIn: string | number = '15m',
): string {
  const opts: SignOptions = { algorithm: 'HS256', expiresIn };
  return jwt.sign(
    { ...payload, iss: TOKEN_ISSUER_LOCAL },
    JWT_SECRET,
    opts,
  );
}

/** Verify a token that we ourselves issued (throws on failure). */
function verifyLocalToken(token: string): LocalPayload {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: TOKEN_ISSUER_LOCAL,
  }) as LocalPayload;
}

/* ------------------------------------------------------------------------ */
/* B)  Microsoft 365 (Azure AD) token verification (RS256/JWKS)             */
/* ------------------------------------------------------------------------ */

const authority = `https://login.microsoftonline.com/${B2C_TENANT_ID}/v2.0`;

/** JWKS client caches keys and rate-limits well-known URI calls. */
const jwks = jwksClient({
  jwksUri: `${authority}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

/** Callback JWKS-RSA expects when verifying a RS256 token. */
function getKey(header: JwtHeader, cb: (err: Error | null, key?: string) => void) {
  if (!header.kid) return cb(new Error('kid missing from token header'));
  jwks.getSigningKey(header.kid, (err, key) =>
    err ? cb(err) : cb(null, key.getPublicKey()),
  );
}

/** Subset of claims we normally care about from Azure-issued tokens. */
export interface AzurePayload {
  sub: string;          // user object ID (immutable)
  email?: string;       // present if `email` scope requested
  tid: string;          // tenant ID
  aud: string;          // must equal our B2C_CLIENT_ID
  iss: string;          // authority URL
}

/** Verify an Azure AD token and return its decoded payload. */
async function verifyAzureToken(token: string): Promise<AzurePayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        audience: B2C_CLIENT_ID,
        issuer: authority,
      },
      (err, decoded) => (err ? reject(err) : resolve(decoded as AzurePayload)),
    );
  });
}

/* ------------------------------------------------------------------------ */
/* C)  Entry-point that attempts both verifications                          */
/* ------------------------------------------------------------------------ */

export type VerifiedToken =
  | { provider: 'local';  payload: LocalPayload }
  | { provider: 'azure';  payload: AzurePayload };

/**
 * Validate an incoming Bearer token, whether local or Microsoft 365.
 *
 * @throws  `jsonwebtoken` errors on invalid signature / expiry.
 */
export async function verifyToken(token: string): Promise<VerifiedToken> {
  try {
    return { provider: 'local', payload: verifyLocalToken(token) };
  } catch {
    const payload = await verifyAzureToken(token);
    return { provider: 'azure', payload };
  }
}
