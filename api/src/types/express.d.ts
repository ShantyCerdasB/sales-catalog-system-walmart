// src/types/express/index.d.ts

import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface User {
      // common required fields
      id: string;
      iss: string;

      // may be absent on Azure payloads
      email?: string;

      // Local-only
      roles?: string[];

      // Azure-only
      oid?: string;
      tid?: string;
      aud?: string;
    }

    interface Request {
      authProvider?: 'local' | 'azure';
      user?: User;
      correlationId?: string;
      log?: Logger;
    }
  }
}

export {};
