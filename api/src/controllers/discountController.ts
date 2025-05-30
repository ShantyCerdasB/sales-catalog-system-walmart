import { Router } from "express";
import { DiscountService } from "../services/discountService";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest";
import { jwtAuth } from "../middleware/jwtAuth";
import {
  DiscountCreateSchema,
  DiscountUpdateSchema,
  DiscountResponseSchema
} from '../types/index';
import { z } from "zod";

const service = new DiscountService();
const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Discounts
 *     description: Operations on product discounts
 */

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: List discounts, optionally filtered by productId
 *     tags:
 *       - Discounts
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the product to filter discounts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of discounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiscountResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  validateQuery(z.object({ productId: z.string().uuid().optional() })),
  async (req, res, next) => {
    try {
      const list = await service.list(req.query.productId as string | undefined);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts/{id}:
 *   get:
 *     summary: Retrieve a single discount by ID
 *     tags:
 *       - Discounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Discount record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 *       404:
 *         description: Discount not found
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
      const discount = await service.getById(req.params.id);
      if (!discount) return res.sendStatus(404);
      res.json(discount);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Create a new discount for a product
 *     tags:
 *       - Discounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountCreate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: The created discount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Discount already exists for product
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateBody(DiscountCreateSchema),
  async (req, res, next) => {
    try {
      const created = await service.create(req.body, req.user!.id);
      res.status(201).json(DiscountResponseSchema.parse(created));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts/{id}:
 *   patch:
 *     summary: Update fields on an existing discount
 *     tags:
 *       - Discounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountUpdate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The updated discount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Discount not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(DiscountUpdateSchema),
  async (req, res, next) => {
    try {
      const updated = await service.update(req.params.id, req.body);
      res.json(DiscountResponseSchema.parse(updated));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts/{id}/activate:
 *   patch:
 *     summary: Activate an existing discount
 *     tags:
 *       - Discounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The activated discount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 *       404:
 *         description: Discount not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/activate",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res, next) => {
    try {
      const updated = await service.activate(req.params.id);
      res.json(DiscountResponseSchema.parse(updated));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts/{id}/deactivate:
 *   patch:
 *     summary: Deactivate an existing discount
 *     tags:
 *       - Discounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The deactivated discount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 *       404:
 *         description: Discount not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/deactivate",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res, next) => {
    try {
      const updated = await service.deactivate(req.params.id);
      res.json(DiscountResponseSchema.parse(updated));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
