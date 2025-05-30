// src/types/express-xss-sanitizer.d.ts

declare module 'express-xss-sanitizer' {
  import { RequestHandler } from 'express';

  /** Options for the sanitizer middleware */
  export interface CleanOptions {
    /** strip XSS vectors */
    xss?: boolean;
    /** strip SQL injection vectors */
    sql?: boolean;
    /** strip NoSQL injection vectors */
    noSql?: boolean;
    /** sanitization depth */
    level?: number;
  }

  /** 
   * Recursively sanitize req.body, req.query & req.headers 
   * (use route-level for req.params)
   */
  export function xss(options?: CleanOptions): RequestHandler;

  /** Alias for xss() */
  export function clean(options?: CleanOptions): RequestHandler;

  /** Low-level sanitizer you can call on arbitrary data */
  export const sanitize: {
    prepareSanitize<T = unknown>(input: T, opts?: CleanOptions): T;
  };
}
