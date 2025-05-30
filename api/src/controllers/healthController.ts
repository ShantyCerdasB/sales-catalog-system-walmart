import { Router, Request, Response } from 'express';
import promClient from 'prom-client';
import { prismaInstance } from '../prisma';

const router: Router = Router();

// Collect default metrics exposed by prom-client (CPU, memory, etc.)
promClient.collectDefaultMetrics();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Liveness and metrics endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Application liveness and database connectivity
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Application is running and database is reachable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: Database unreachable or application unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: unreachable
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Simple query to verify DB connectivity
    await prismaInstance.$queryRaw`SELECT 1`;
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
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus-formatted metrics endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Metrics in Prometheus exposition format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Prometheus metrics payload
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

export default router;
