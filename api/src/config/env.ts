import dotenv from 'dotenv';

dotenv.config();

// Simplified environment loader without strict Zod validation
// Loads variables from .env and exposes them directly
export const WEBAPP_URL = process.env.WEBAPP_URL || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SHADOW_DATABASE_URL = process.env.SHADOW_DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const TOKEN_ISSUER_LOCAL = process.env.TOKEN_ISSUER_LOCAL;

// Expose full env object if needed
export const env = {
  WEBAPP_URL,
  DATABASE_URL,
  SHADOW_DATABASE_URL,
  JWT_SECRET,
  TOKEN_ISSUER_LOCAL,
};
