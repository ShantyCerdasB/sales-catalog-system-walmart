import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'express-xss-sanitizer';

import publicRoutes from './routes/public';       // health & auth
import protectedRoutes from './routes/protected'; // products, clients, discounts, sales, reports
import { jwtAuth } from './middleware/jwtAuth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { closePrisma } from './prisma';

const PORT = Number(process.env.PORT ?? 4000);
const app = express();

// 1) Security headers
app.use(helmet());

// 2) CORS
app.use(cors({ origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? '*' }));

// 3) JSON parsing
app.use(express.json());

// 4) Rate limiting (100 req per 15m per IP)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 5) Global XSS sanitization
app.use(xss());

// 6) Mount public routes (no JWT required)
app.use('/api', publicRoutes);

// 7) JWT guard for all subsequent /api routes
app.use(jwtAuth());

// 8) Mount protected routes
app.use('/api', protectedRoutes);

// 9) Global error handler
app.use(errorHandler());

// Start server & graceful shutdown
const server = app.listen(PORT, () =>
  logger.info(`🚀 API listening on http://localhost:${PORT}`)
);

async function shutdown(signal: string) {
  try {
    logger.info(`Received ${signal}. Shutting down…`);
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
  process.on(sig, () => shutdown(sig))
);
