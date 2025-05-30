import { Router } from "express";
import { ReportService } from "../services/reportService";
import { validateQuery } from "../middleware/validateRequest";
import { jwtAuth } from "../middleware/jwtAuth";
import { z } from "zod";

const service = new ReportService();
const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Aggregated sales reports
 */

/**
 * @swagger
 * /reports/top-products:
 *   get:
 *     summary: Retrieve top products by units sold
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of products to return
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO date lower bound (inclusive)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO date upper bound (inclusive)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of top product entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product:
 *                     $ref: '#/components/schemas/ProductResponse'
 *                   totalUnits:
 *                     type: integer
 *                     description: Total units sold
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/top-products",
  validateQuery(z.object({
    limit: z.string().optional(),
    from:  z.string().datetime().optional(),
    to:    z.string().datetime().optional()
  })),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const fromDt = req.query.from ? new Date(String(req.query.from)) : undefined;
      const toDt   = req.query.to   ? new Date(String(req.query.to))   : undefined;
      const report = await service.getTopProducts(limit, fromDt, toDt);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /reports/top-clients:
 *   get:
 *     summary: Retrieve top clients by transaction count
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of clients to return
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO date lower bound (inclusive)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO date upper bound (inclusive)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of top client entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   client:
 *                     $ref: '#/components/schemas/ClientResponse'
 *                   transactionCount:
 *                     type: integer
 *                     description: Number of transactions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/top-clients",
  validateQuery(z.object({
    limit: z.string().optional(),
    from:  z.string().datetime().optional(),
    to:    z.string().datetime().optional()
  })),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const fromDt = req.query.from ? new Date(String(req.query.from)) : undefined;
      const toDt   = req.query.to   ? new Date(String(req.query.to))   : undefined;
      const report = await service.getTopClients(limit, fromDt, toDt);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
