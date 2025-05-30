
import { z } from "zod";
import {
  SaleItemCreateSchema,
  SaleItemResponseSchema,
} from "./saleItem";

/**
 * Full Sale record schema.
 */
export const SaleSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid().nullable().optional(),
  date: z.string().datetime(),
  subtotal: z.number().nonnegative(),
  discountTotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentMethod: z.enum(["cash"]),
  isCanceled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(SaleItemResponseSchema),
});
export type Sale = z.infer<typeof SaleSchema>;

/**
 * What we send back to clients.
 */
export const SaleResponseSchema = SaleSchema;
export type SaleResponse = z.infer<typeof SaleResponseSchema>;

/**
 * Input for creating a sale.
 * Excludes system fields & cancellation flag.
 */
export const SaleCreateSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  date: z.string().datetime(),
  subtotal: z.number().nonnegative(),
  discountTotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentMethod: z.enum(["cash"]),
  items: z.array(SaleItemCreateSchema),
});
export type SaleCreate = z.infer<typeof SaleCreateSchema>;

/**
 * Input for toggling cancel flag.
 */
export const SaleCancelSchema = z.object({
  isCanceled: z.boolean(),
});
export type SaleCancel = z.infer<typeof SaleCancelSchema>;