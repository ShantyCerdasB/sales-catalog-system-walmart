// apps/api/src/controllers/discountController.ts

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { DiscountResponse } from "@sales-catalog/types";
import {
  DiscountCreateSchema,
  DiscountUpdateSchema,
} from "@sales-catalog/types";
import { discountService } from "../services/discountService";
import { validateBody, validateParams } from "../middleware/validateRequest";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Discounts
 *     description: CRUD operations on discounts
 */

/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Create a new discount
 *     tags: [Discounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountCreate'
 *     responses:
 *       201:
 *         description: Created discount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 */
router.post(
  "/",
  validateBody(DiscountCreateSchema),
  async (req: Request<{}, {}, unknown>, res: Response<DiscountResponse>, next: NextFunction) => {
    try {
      const dto = await discountService.create(req.body);
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: List all discounts
 *     tags: [Discounts]
 *     responses:
 *       200:
 *         description: Array of discounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiscountResponse'
 */
router.get(
  "/",
  async (_: Request, res: Response<DiscountResponse[]>, next: NextFunction) => {
    try {
      const list = await discountService.list();
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
 *     summary: Get a discount by ID
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Discount ID
 *     responses:
 *       200:
 *         description: Discount found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 *       404:
 *         description: Discount not found
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req: Request, res: Response<DiscountResponse>, next: NextFunction) => {
    try {
      const dto = await discountService.get(req.params.id);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts/{id}:
 *   put:
 *     summary: Update a discount
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Discount ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscountUpdate'
 *     responses:
 *       200:
 *         description: Updated discount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResponse'
 */
router.put(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(DiscountUpdateSchema),
  async (req: Request, res: Response<DiscountResponse>, next: NextFunction) => {
    try {
      const dto = await discountService.update(req.params.id, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     summary: Delete a discount
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Discount ID
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await discountService.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
