import { Router, Request, Response } from 'express';
import promClient from 'prom-client';
import { prisma } from '../prisma';

/**
 * HealthController
 *
 * • GET /health   → Liveness and database connectivity check.
 * • GET /metrics  → Prometheus-compatible metrics endpoint.
 */
const router: Router = Router();

// Initialize default Prometheus metrics collection
promClient.collectDefaultMetrics();

/**
 * GET /health
 *
 * Returns 200 if the application is running and the database can be queried.
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Simple database ping
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'unreachable',
    });
  }
});

/**
 * GET /metrics
 *
 * Returns Prometheus-formatted metrics for scraping.
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

export default router;
