import { Router } from "express";
import { SaleService } from "../services/saleService";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest";
import { jwtAuth } from "../middleware/jwtAuth";
import {
  SaleCreateSchema,
  SaleCancelSchema,
  SaleResponseSchema
} from '../types/index';
import { z } from "zod";

const service = new SaleService();
const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Sales
 *     description: Sales transaction operations
 */

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: List sales with optional pagination
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of sales with summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SaleResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  validateQuery(z.object({
    skip: z.string().optional(),
    take: z.string().optional()
  })),
  async (req, res, next) => {
    try {
      const skip = Number(req.query.skip) || 0;
      const take = Number(req.query.take) || 100;
      const list = await service.list({ skip, take });
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Retrieve a single sale by ID, including line items
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the sale
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed sale record with items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleResponse'
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res, next) => {
    try {
      const sale = await service.getById(req.params.id);
      if (!sale) return res.sendStatus(404);
      res.json(sale);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale with line items
 *     tags:
 *       - Sales
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleCreate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: The created sale record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateBody(SaleCreateSchema),
  async (req, res, next) => {
    try {
      const created = await service.create(req.body, req.user!.id);
      res.status(201).json(SaleResponseSchema.parse(created));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /sales/{id}/cancel:
 *   patch:
 *     summary: Cancel an existing sale
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the sale to cancel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleCancel'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Sale canceled successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/cancel",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(SaleCancelSchema),
  async (req, res, next) => {
    try {
      await service.cancel(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
