// src/types/express/index.d.ts
import type { Logger } from 'pino';
import type { LocalPayload, AzurePayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      /**
       * Authentication provider that issued the JWT.
       * 'local'  – credentials managed in-house
       * 'azure'  – Microsoft Entra ID token
       */
      authProvider?: 'local' | 'azure';

      /** Decoded JWT payload confirmed by the auth middleware */
      user?: LocalPayload | AzurePayload;

      /** Correlation identifier set per request for log tracing */
      correlationId?: string;

      /** Logger instance already bound to correlationId */
      log?: Logger;
    }
  }
}

export {}; // Ensure the file is treated as an ES module
