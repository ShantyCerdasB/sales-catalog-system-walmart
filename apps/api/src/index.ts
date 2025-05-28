/* src/server.ts
   --------------------------------------------------------------------------
   Express entry-point for the Sales-Catalog API.

   The middleware chain is laid out in a sensible order:

     • helmet          Minimal security headers.
     • cors            Origins are read from the .env file.
     • express.json    Parses JSON request bodies.
     • rateLimit       Soft throttle: 100 calls per 15 min per IP.
     • xss             Scrubs obvious XSS vectors from body and query.
     • public router   Health-check and auth endpoints.
     • jwtAuth         Everything that follows must carry a valid token.
     • protected router Business functionality: products, clients, etc.
     • errorHandler    Converts any thrown error into a clean JSON response.

   A small shutdown helper closes the HTTP listener and the Prisma pool
   when the process receives SIGINT or SIGTERM.
*/

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'express-xss-sanitizer';

import router from './routes';
import { jwtAuth } from './middleware/jwtAuth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { closePrisma } from './prisma';

const PORT = Number(process.env.PORT ?? 4000);
const app = express();

/* security headers */
app.use(helmet());

/* CORS – split the comma-separated list from .env and ignore blanks */
app.use(
  cors({
    origin: (process.env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean),
    credentials: true,
  }),
);

/* body-parser for JSON payloads */
app.use(express.json());

/* basic rate-limiter: 100 requests every 15 minutes */
app.use(
  rateLimit({
    windowMs: 15 * 60_000,
    max: 100,
  }),
);

/* global XSS sanitiser */
app.use(xss());

/* public endpoints: health and auth */
app.use('/api', router.public);

/* token guard */
app.use(jwtAuth());

/* protected endpoints */
app.use('/api', router.protected);

/* error handler always goes last */
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});

/* graceful shutdown */
async function shutdown(signal: string) {
  try {
    logger.info(`${signal} received – shutting down`);
    server.close();
    await closePrisma();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', err);
    process.exit(1);
  }
}

['SIGINT', 'SIGTERM'].forEach(sig =>
  process.on(sig, () => shutdown(sig)),
);
