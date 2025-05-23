import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { saleService } from "../services/saleService";
import { validateBody } from "../middleware/validateRequest";

/**
 * Controller for /sales routes
 * • POST /sales → create a new sale
 * (other endpoints can be added: GET /sales, GET /sales/:id, etc.)
 */
const router: Router = Router();
// Zod schema for creating a sale
const createSaleSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

// POST /sales
router.post(
  "/",
  validateBody(createSaleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientId = null, items } = req.body;
      const sale = await saleService.create(clientId, items);
      res.status(201).json(sale);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
