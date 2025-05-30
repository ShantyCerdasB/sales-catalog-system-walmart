// api/src/controllers/saleItemController.ts

import { Router, Request, Response, NextFunction } from "express";
import { SaleItemService } from "../services/saleItemService";
import { jwtAuth } from "../middleware/jwtAuth";
import { validateParams } from "../middleware/validateRequest";
import { z } from "zod";

const router = Router();
const service = new SaleItemService();

/**
 * @swagger
 * tags:
 *   - name: SaleItem
 *     description: Sale line items
 */

/**
 * @swagger
 * /sales/{saleId}/items:
 *   get:
 *     summary: List all line items for a given sale
 *     tags:
 *       - SaleItem
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the sale to fetch items for
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of sale item records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SaleItemResponse'
 *       400:
 *         description: Invalid saleId parameter
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found or no items
 *       500:
 *         description: Server error
 */
router.get(
  "/sales/:saleId/items",
  validateParams(z.object({ saleId: z.string().uuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await service.getBySaleId(req.params.saleId);
      if (!items || items.length === 0) {
        return res.sendStatus(404);
      }
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
