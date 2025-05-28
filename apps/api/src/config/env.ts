/*
   Environment-variable validation for the Sales Catalog API.

   • Every required key is checked at startup with Zod.
   • Keeps runtime crashes away from production by failing fast.
   • Exposes either individual constants or a full `initEnv()` helper,
     whichever style fits the calling module.
*/

import { z } from 'zod';

/* ───────────── Schema definition ───────────── */

const envSchema = z.object({
  /* Azure subscription & resource identifiers */
  SUBSCRIPTION_ID: z.string().uuid(),
  TENANT_ID:        z.string().uuid(),
  RESOURCE_GROUP:   z.string(),
  LOCATION:         z.string(),

  /* Azure Container Registry & front-end host */
  ACR_LOGIN_SERVER: z.string(),
  WEBAPP_URL:       z.string().url(),
  VITE_API_BASE_URL: z.string(),

  /* Storage / queues / bus */
  STORAGE_CONN_STR:                z.string(),
  AZURE_WEB_JOBS_STORAGE:          z.string(),
  QUEUE_NAME:                      z.string(),
  SERVICE_BUS_CONNECTION_STRING:   z.string(),
  SERVICE_BUS_QUEUE_NAME:          z.string(),
  BLOB_STORAGE_CONNECTION_STRING:  z.string(),
  BLOB_CONTAINER_REPORTS:          z.string(),

  /* Azure Functions */
  FUNCTIONS_WORKER_RUNTIME: z.string(),
  FUNCTION_EMAIL_NAME:      z.string(),
  FUNCTION_REPORTS_NAME:    z.string(),

  /* Observability */
  APP_INSIGHTS_KEY: z.string(),

  /* Key Vault */
  KEYVAULT_URI: z.string().url(),

  /* Database */
  DATABASE_URL:        z.string(),
  SHADOW_DATABASE_URL: z.string().optional(),

  /* API Management */
  APIM_URL: z.string().url(),

  /* Azure AD B2C */
  B2C_APP_NAME:            z.string(),
  B2C_TENANT_ID:           z.string().uuid(),
  B2C_CLIENT_ID:           z.string().uuid(),
  B2C_CLIENT_SECRET:       z.string(),
  B2C_SIGNUP_SIGNIN_POLICY:z.string(),
  B2C_AUTHORITY:           z.string().url(),
  B2C_SCOPE:               z.string(),

  /* JSON Web Tokens  */
  JWT_SECRET:         z.string(),  /* strong random key for HS256 signing */
  TOKEN_ISSUER_LOCAL: z.string(),  /* issuer claim used by our own tokens */

  /* Misc */
  CORS_ALLOWED_ORIGINS: z.string().optional(),  
  EMAIL_PROVIDER:       z.string().optional(),
  SENDGRID_API_KEY:     z.string().optional(),
});

/* ───────────── Helper ───────────── */

/* Validates once and freezes the result so nothing can mutate it later. */
export function initEnv() {
  return Object.freeze(envSchema.parse(process.env));
}

/* Immediate validation for named exports */
const env = initEnv();

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
  JWT_SECRET,
  TOKEN_ISSUER_LOCAL,
  CORS_ALLOWED_ORIGINS,
  EMAIL_PROVIDER,
  SENDGRID_API_KEY,
} = env;
