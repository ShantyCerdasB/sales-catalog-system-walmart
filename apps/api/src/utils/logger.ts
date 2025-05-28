/* Winston setup with two faces:

     • Production   – JSON output, ready for Azure App Insights or any service
                      that prefers structured logs.
     • Development  – Timestamped, colour-coded strings that are easy to scan
                      in a local terminal.

   A slim wrapper (`log.info`, `log.warn`, …) avoids sprinkling
   `logger.<level>()` calls all over the codebase.
*/

import winston from 'winston';

const isProd = process.env.NODE_ENV === 'production';

/* Core logger ------------------------------------------------------------- */
export const logger = winston.createLogger({
  level: 'info',

  /* Choose format based on environment. */
  format: isProd
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${extra}`;
        }),
      ),

  transports: [new winston.transports.Console()],
});

/* Simple shorthand so callers write `log.info()` instead of reaching into
   the Winston instance every time. */
export const log = {
  info:  (msg: string, meta?: unknown) => logger.info( msg, meta),
  warn:  (msg: string, meta?: unknown) => logger.warn( msg, meta),
  error: (msg: string, meta?: unknown) => logger.error(msg, meta),
  debug: (msg: string, meta?: unknown) => logger.debug(msg, meta),
};
