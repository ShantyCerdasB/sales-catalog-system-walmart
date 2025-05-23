/* Tell TypeScript about the extra properties we add to Request */
import 'express-serve-static-core';
import { LocalPayload, AzurePayload } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    authProvider?: 'local' | 'azure';
    user?: LocalPayload | AzurePayload;
  }
}
