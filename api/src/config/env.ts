/*
   Environment-variable validation for the Sales Catalog API.

   • Every required key is checked at startup with Zod.
   • Keeps runtime crashes away from production by failing fast.
   • Exposes either individual constants or a full `initEnv()` helper,
     whichever style fits the calling module.
*/

import { z } from 'zod';


const envSchema = z.object({

  WEBAPP_URL:       z.string().url(),


  /* Database */
  DATABASE_URL:        z.string(),
  SHADOW_DATABASE_URL: z.string().optional(),


  /* JSON Web Tokens  */
  JWT_SECRET:         z.string(),  /* strong random key for HS256 signing */
  TOKEN_ISSUER_LOCAL: z.string(),  /* issuer claim used by our own tokens */

});

/* ───────────── Helper ───────────── */

/* Validates once and freezes the result so nothing can mutate it later. */
export function initEnv() {
  return Object.freeze(envSchema.parse(process.env));
}

/* Immediate validation for named exports */
const env = initEnv();

export const {
  WEBAPP_URL,
  DATABASE_URL,
  SHADOW_DATABASE_URL,
  JWT_SECRET,
  TOKEN_ISSUER_LOCAL,

} = env;
