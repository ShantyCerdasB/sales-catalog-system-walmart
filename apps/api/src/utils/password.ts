import argon2 from 'argon2';

/**
 * Password hashing & verification utilities using Argon2id.
 *
 * Requirements:
 *  • Hash length ≥ 32 bytes, argon2id for resistance to GPU attacks.
 *  • Salt is generated internally by argon2.default.
 *  • Verification throws on mismatch.
 */

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,    
  timeCost: 3,             
  parallelism: 1,          
};

/**
 * Hash a plain-text password.
 * @param password   The user’s plain-text password.
 * @returns          A promise resolving to the Argon2 hash.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, HASH_OPTIONS);
}

/**
 * Verify a plain-text password against its hash.
 * @param hash       The stored Argon2 hash.
 * @param password   The login attempt’s plain-text password.
 * @throws           Throws if verification fails.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
