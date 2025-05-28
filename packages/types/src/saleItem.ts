// packages/types/src/saleItem.ts
import { z } from "zod";

/**
 * Full SaleItem record schema.
 */
export const SaleItemSchema = z.object({
  id: z.string().uuid(),
  saleId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  discountApplied: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/** Full TypeScript type for SaleItem. */
export type SaleItem = z.infer<typeof SaleItemSchema>;

/**
 * Response schema: what is returned to clients.
 * Omits `saleId` (since it's implied in the parent Sale).
 */
export const SaleItemResponseSchema = SaleItemSchema.omit({ saleId: true });

/** TS type for API response shape. */
export type SaleItemResponse = z.infer<typeof SaleItemResponseSchema>;

/**
 * Input schema for creating a line item.
 * Excludes ID and timestamps.
 */
export const SaleItemCreateSchema = SaleItemSchema.pick({
  productId: true,
  quantity: true,
  unitPrice: true,
  discountApplied: true,
});

export type SaleItemCreate = z.infer<typeof SaleItemCreateSchema>;
