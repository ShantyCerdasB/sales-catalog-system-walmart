// apps/api/src/controllers/productController.ts

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ProductResponse } from "@sales-catalog/types";
import {
  ProductCreateSchema,
  ProductUpdateSchema,
} from "@sales-catalog/types";
import { productService } from "../services/productService";
import { validateBody, validateParams } from "../middleware/validateRequest";


declare global {
  namespace Express {
    interface Request {
      user: { id: string };
    }
  }
}

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: CRUD operations on products
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
router.post(
  "/",
  validateBody(ProductCreateSchema),
  async (req: Request<{}, {}, unknown>, res: Response<ProductResponse>, next: NextFunction) => {
    try {
      const product = await productService.create(req.body, req.user.id);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 */
router.get(
  "/",
  async (_: Request, res: Response<ProductResponse[]>, next: NextFunction) => {
    try {
      const list = await productService.list();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req: Request, res: Response<ProductResponse>, next: NextFunction) => {
    try {
      const product = await productService.get(req.params.id);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
router.put(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(ProductUpdateSchema),
  async (req: Request, res: Response<ProductResponse>, next: NextFunction) => {
    try {
      const updated = await productService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Soft-delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Product ID
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await productService.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
