declare module 'perfect-express-sanitizer' {
  interface SanitizeOptions {
    xss?: boolean;
    sql?: boolean;
    noSql?: boolean;
    level?: number;
  }

  const pes: {
    sanitize: {
      prepareSanitize<T = unknown>(input: T, opts?: SanitizeOptions): T;
    };
    clean: (
      opts?: SanitizeOptions,
      whiteList?: string[],
      only?: Array<'body' | 'query' | 'headers'>
    ) => import('express').RequestHandler;
  };

  export default pes;
}
