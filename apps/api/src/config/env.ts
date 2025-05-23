/* ──────────────────────────────  src/config/env.ts  ───────────────────────────
 * Environment-variable validation and helper utilities for the Sales Catalog
 * API. All required variables are verified at runtime with **Zod** to catch
 * mis-configuration early.
 *
 * ▸ How to use
 *   1. Import individual variables:
 *        import { DATABASE_URL } from './config/env';
 *
 *   2. Or import the `initEnv` helper to obtain the full typed object:
 *        const env = initEnv();                 // validated on first call
 *
 * The file exports both styles so you can choose what best fits your module.
 * ──────────────────────────────────────────────────────────────────────────── */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Schema declaration                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Zod schema that describes **all** supported environment variables.
 *
 * Every property is required unless explicitly marked as `.optional()`.
 * UUIDs and URLs are syntactically validated; strings such as
 * `CORS_ALLOWED_ORIGINS` may contain comma-separated values (CSV) and are left
 * as plain strings so each caller can parse them as needed.
 */
const envSchema = z.object({
  /* Azure subscription & resource identifiers */
  SUBSCRIPTION_ID: z.string().uuid(),
  TENANT_ID: z.string().uuid(),
  RESOURCE_GROUP: z.string(),
  LOCATION: z.string(),

  /* Azure Container Registry & Web App */
  ACR_LOGIN_SERVER: z.string(),
  WEBAPP_URL: z.string().url(),

  /* Front-end base URL injected by Vite */
  VITE_API_BASE_URL: z.string(),

  /* Storage / Queue / Service Bus */
  STORAGE_CONN_STR: z.string(),
  AZURE_WEB_JOBS_STORAGE: z.string(),
  QUEUE_NAME: z.string(),
  SERVICE_BUS_CONNECTION_STRING: z.string(),
  SERVICE_BUS_QUEUE_NAME: z.string(),
  BLOB_STORAGE_CONNECTION_STRING: z.string(),
  BLOB_CONTAINER_REPORTS: z.string(),

  /* Azure Functions */
  FUNCTIONS_WORKER_RUNTIME: z.string(),
  FUNCTION_EMAIL_NAME: z.string(),
  FUNCTION_REPORTS_NAME: z.string(),

  /* Observability */
  APP_INSIGHTS_KEY: z.string(),

  /* Key Vault */
  KEYVAULT_URI: z.string().url(),

  /* Database */
  DATABASE_URL: z.string(),
  SHADOW_DATABASE_URL: z.string().optional(),

  /* API Management */
  APIM_URL: z.string().url(),

  /* Azure AD B2C */
  B2C_APP_NAME: z.string(),
  B2C_TENANT_ID: z.string().uuid(),
  B2C_CLIENT_ID: z.string().uuid(),
  B2C_CLIENT_SECRET: z.string(),
  B2C_SIGNUP_SIGNIN_POLICY: z.string(),
  B2C_AUTHORITY: z.string().url(),
  B2C_SCOPE: z.string(),

  /* Misc */
  CORS_ALLOWED_ORIGINS: z.string().optional(),  // CSV list
  EMAIL_PROVIDER: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/* Helper function                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Validate `process.env` once and return a **typed copy** of the environment.
 *
 * If validation fails, Zod will throw an error and the application will exit
 * during startup, preventing undefined behaviour later on.
 *
 * @returns A frozen object whose keys match `envSchema` and whose values are
 *          guaranteed to satisfy the declared constraints.
 */
export function initEnv() {
  return Object.freeze(envSchema.parse(process.env));
}

/* -------------------------------------------------------------------------- */
/* Immediate validation for named exports                                     */
/* -------------------------------------------------------------------------- */

/* Validate eagerly so individual named exports are safe to use on import. */
const env = initEnv();

/* Destructure and export each property for convenience. */
export const {
  SUBSCRIPTION_ID,
  TENANT_ID,
  RESOURCE_GROUP,
  LOCATION,
  ACR_LOGIN_SERVER,
  WEBAPP_URL,
  VITE_API_BASE_URL,
  STORAGE_CONN_STR,
  AZURE_WEB_JOBS_STORAGE,
  QUEUE_NAME,
  SERVICE_BUS_CONNECTION_STRING,
  SERVICE_BUS_QUEUE_NAME,
  BLOB_STORAGE_CONNECTION_STRING,
  BLOB_CONTAINER_REPORTS,
  FUNCTIONS_WORKER_RUNTIME,
  FUNCTION_EMAIL_NAME,
  FUNCTION_REPORTS_NAME,
  APP_INSIGHTS_KEY,
  KEYVAULT_URI,
  DATABASE_URL,
  SHADOW_DATABASE_URL,
  APIM_URL,
  B2C_APP_NAME,
  B2C_TENANT_ID,
  B2C_CLIENT_ID,
  B2C_CLIENT_SECRET,
  B2C_SIGNUP_SIGNIN_POLICY,
  B2C_AUTHORITY,
  B2C_SCOPE,
  CORS_ALLOWED_ORIGINS,
  EMAIL_PROVIDER,
  SENDGRID_API_KEY,
} = env;
