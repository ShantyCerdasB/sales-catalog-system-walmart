/*  Helpers for two-source authentication:

     • Local accounts – HS256 tokens that this API signs.
     • Microsoft 365  – RS256 tokens issued by Azure AD.

   Public surface
   ───────────────────────────────────────────────
     signLocalToken()   Creates a short-lived HS256 token.
     verifyToken()      Accepts either token type and returns
                        { provider, payload }.
*/

import jwt, { JwtHeader, SignOptions } from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';

import {
  JWT_SECRET,
  TOKEN_ISSUER_LOCAL,
  B2C_TENANT_ID,
  B2C_CLIENT_ID,
} from '../config/env';

/* ───────────── Local tokens (HS256) ───────────── */

/* Payload embedded in tokens we mint in-house. */
export interface LocalPayload {
  id: string;          /* primary key in the users table          */
  email: string;
  roles?: string[];
  iss: string;         /* always TOKEN_ISSUER_LOCAL               */
}

/* Create a token for an internal account. */
export function signLocalToken(
  payload: Omit<LocalPayload, 'iss'>,
  expiresIn: SignOptions['expiresIn'] = '15m',
): string {
  const opts: SignOptions = { algorithm: 'HS256', expiresIn };
  const { id, ...rest } = payload;

  /* JWT spec uses `sub` for the principal; keep `id` when decoding. */
  return jwt.sign(
    { sub: id, ...rest, iss: TOKEN_ISSUER_LOCAL },
    JWT_SECRET,
    opts,
  );
}

/* Validate a locally-signed token and map it to LocalPayload. */
function verifyLocalToken(token: string): LocalPayload {
  const data = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: TOKEN_ISSUER_LOCAL,
  }) as jwt.JwtPayload;

  return {
    id:  data.sub  as string,
    email: data.email as string,
    roles: data.roles as string[] | undefined,
    iss: data.iss  as string,
  };
}

/* ───────────── Azure AD tokens (RS256 + JWKS) ───────────── */

const authority = `https://login.microsoftonline.com/${B2C_TENANT_ID}/v2.0`;

/* JWKS client caches keys and respects Azure rate limits. */
const jwks = jwksClient({
  jwksUri: `${authority}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

/* Supplies the correct public key to jsonwebtoken when verifying RS256 tokens. */
function getKey(
  header: JwtHeader,
  cb: (err: Error | null, key?: string) => void,
): void {
  const kid = header.kid;
  if (!kid) {
    cb(new Error('Missing kid in token header'));
    return;
  }

  jwks.getSigningKey(kid, (err: Error | null, key?: SigningKey) => {
    if (err || !key) {
      cb(err ?? new Error('Signing key not found'));
      return;
    }
    cb(null, key.getPublicKey());
  });
}

/* Minimal set of Azure claims we care about. */
export interface AzurePayload {
  id: string;          /* derived from `sub` or `oid`              */
  oid?: string;
  email?: string;
  tid: string;
  aud: string;
  iss: string;
}

/* Validate an Azure token and adapt it to AzurePayload. */
function verifyAzureToken(token: string): Promise<AzurePayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        audience:  B2C_CLIENT_ID,
        issuer:    authority,
      },
      (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }

        const d = decoded as jwt.JwtPayload;
        resolve({
          id:  (d.sub || d.oid) as string,
          oid: d.oid   as string | undefined,
          email: d.email as string | undefined,
          tid: d.tid   as string,
          aud: d.aud   as string,
          iss: d.iss   as string,
        });
      },
    );
  });
}


/* Entry-point that attempts both verifications                          */


export type VerifiedToken =
  | { provider: 'local'; payload: LocalPayload }
  | { provider: 'azure'; payload: AzurePayload };

/* Accept any Bearer token we allow and return a typed payload. */
export async function verifyToken(token: string): Promise<VerifiedToken> {
  try {
    return { provider: 'local', payload: verifyLocalToken(token) };
  } catch {
    const payload = await verifyAzureToken(token);
    return { provider: 'azure', payload };
  }
}
