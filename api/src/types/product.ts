import { z } from "zod";
import { DiscountResponseSchema } from "./discount";

/**
 * Output schema: exactly what you send back to clients.
 */
export const ProductResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  unit: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  discount: DiscountResponseSchema.optional(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

/**
 * Input schema for creating a product.
 * — no `id`, `isDeleted`, timestamps or nested `discount`.
 */
export const ProductCreateSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  unit: z.string(),
});

export type ProductCreate = z.infer<typeof ProductCreateSchema>;

/**
 * Input schema for updating a product.
 * All create-fields optional, still no system fields.
 */
export const ProductUpdateSchema = ProductCreateSchema.partial();
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;