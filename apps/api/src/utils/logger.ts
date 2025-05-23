/* ────────────────────────────────  logger.ts  ───────────────────────────────
 * Centralised Winston logger configuration.
 * ---------------------------------------------------------------------------
 * Logs in JSON when running in production (so Azure App Insights ingests it
 * correctly) and in colourised plain text when `NODE_ENV !== 'production'`.
 * ------------------------------------------------------------------------ */

import winston from 'winston';

const isProd = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: 'info',
  format: isProd
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`,
        ),
      ),
  transports: [new winston.transports.Console()],
});

/* Convenience wrappers ---------------------------------------------------- */

export const log = {
  info: (msg: string, meta?: unknown) => logger.info(msg, meta),
  warn: (msg: string, meta?: unknown) => logger.warn(msg, meta),
  error: (msg: string, meta?: unknown) => logger.error(msg, meta),
  debug: (msg: string, meta?: unknown) => logger.debug(msg, meta),
};
