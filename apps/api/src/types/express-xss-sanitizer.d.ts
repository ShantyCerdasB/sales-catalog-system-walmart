
declare module 'express-xss-sanitizer' {
  import { RequestHandler } from 'express';

  interface CleanOptions {
    xss?: boolean;
    sql?: boolean;
    noSql?: boolean;
    level?: number;
  }

  const xss: {
    (): RequestHandler;                          
    clean(options?: CleanOptions): RequestHandler;
    sanitize: {
      prepareSanitize<T = unknown>(input: T, opts?: CleanOptions): T;
    };
  };

  export default xss;
}
