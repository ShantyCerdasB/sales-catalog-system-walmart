// apps/api/src/controllers/reportController.ts
import { Router, Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService';
import { z } from 'zod';

/**
 * Controller for /reports routes
 * • GET /reports/top-products
 * • GET /reports/top-clients
 */
const router: Router = Router();

// Zod schemas for query validation
const topProductsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  by:    z.enum(['units', 'revenue']).default('units'),
  from:  z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid date' }),
  to:    z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid date' }),
});

const topClientsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).default('5'),
  from:  z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid date' }),
  to:    z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid date' }),
});

/**
 * GET /reports/top-products
 * Parses and validates query, then delegates to reportService.
 */
router.get(
  '/top-products',
  // Validation middleware
  (req, _res, next) => {
    try {
      // Parse into a new, strongly-typed object
      const parsed = topProductsSchema.parse(req.query);
      // Store it on a custom request property
      (req as any).validatedQuery = parsed;
      next();
    } catch (err) {
      next(err);
    }
  },
  // Controller handler
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract from our custom property
      const { limit, by, from, to } = (req as any).validatedQuery as z.infer<typeof topProductsSchema>;
      const data = await reportService.topProducts(limit, by, from, to);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /reports/top-clients
 * Parses and validates query, then delegates to reportService.
 */
router.get(
  '/top-clients',
  // Validation middleware
  (req, _res, next) => {
    try {
      const parsed = topClientsSchema.parse(req.query);
      (req as any).validatedQuery = parsed;
      next();
    } catch (err) {
      next(err);
    }
  },
  // Controller handler
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, from, to } = (req as any).validatedQuery as z.infer<typeof topClientsSchema>;
      const data = await reportService.topClients(limit, from, to);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
