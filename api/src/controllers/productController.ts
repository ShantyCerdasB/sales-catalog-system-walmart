import { Router } from "express";
import { ProductService } from "../services/productService";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest";
import { jwtAuth } from "../middleware/jwtAuth";
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductResponseSchema
} from '../types/index';
import { z } from "zod";

const service = new ProductService();
const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product catalog operations
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products with optional filtering by code and name
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Substring to filter product codes
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Substring to filter product names
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
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include soft-deleted products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  validateQuery(z.object({
    code: z.string().optional(),
    name: z.string().optional()
  })),
  async (req, res, next) => {
    try {
      const { code, name } = req.query as Record<string, string>;
      const products = await service.list({
        skip: Number(req.query.skip) || 0,
        take: Number(req.query.take) || 100,
        includeDeleted: req.query.includeDeleted === "true",
        code,
        name
      });
      res.json(products);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve a single product by ID
 *     tags:
 *       - Products
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
 *         description: Product record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
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
      const product = await service.getById(req.params.id);
      if (!product) return res.sendStatus(404);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate product code
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateBody(ProductCreateSchema),
  async (req, res, next) => {
    try {
      const created = await service.create(req.body, req.user!.id);
      res.status(201).json(ProductResponseSchema.parse(created));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update an existing product
 *     tags:
 *       - Products
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
 *             $ref: '#/components/schemas/ProductUpdate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(ProductUpdateSchema),
  async (req, res, next) => {
    try {
      const updated = await service.update(req.params.id, req.body);
      res.json(ProductResponseSchema.parse(updated));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Soft delete a product
 *     tags:
 *       - Products
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
 *       204:
 *         description: Product marked as deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res, next) => {
    try {
      await service.delete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
