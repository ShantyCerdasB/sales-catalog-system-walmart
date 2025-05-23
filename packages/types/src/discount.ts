// packages/types/src/discount.ts
import { z } from "zod";

/**
 * Zod schema for a Discount record.
 *
 * Fields:
 * - `id`         : UUID string, primary key.
 * - `code`       : Unique discount code (e.g. "SUMMER25").
 * - `percentage` : Discount percentage (0–100).
 * - `validFrom`  : ISO-8601 start date.
 * - `validTo`    : Optional ISO-8601 end date.
 * - `isActive`   : Whether the discount is currently active.
 * - `productId`  : UUID of the associated Product (one-to-one).
 * - `createdAt`  : ISO-8601 timestamp of creation.
 * - `updatedAt`  : ISO-8601 timestamp of last update.
 */
export const DiscountSchema = z.object({
  id:         z.string().uuid(),
  code:       z.string(),
  percentage: z.number().min(0).max(100),
  validFrom:  z.string().datetime(),
  validTo:    z.string().datetime().nullable().optional(),
  isActive:   z.boolean(),
  productId:  z.string().uuid(),
  createdAt:  z.string().datetime(),
  updatedAt:  z.string().datetime(),
});

/** TypeScript type inferred from `DiscountSchema`. */
export type Discount = z.infer<typeof DiscountSchema>;

/**
 * Response schema: what is sent back to clients, excludes `productId`.
 */
export const DiscountResponseSchema = DiscountSchema.omit({ productId: true });

/** TypeScript type for API response shape. */
export type DiscountResponse = z.infer<typeof DiscountResponseSchema>;

/**
 * Schema for creating a Discount.
 * Excludes system fields (id, createdAt, updatedAt), but includes productId.
 */
export const DiscountCreateSchema = DiscountSchema.pick({
  code:       true,
  percentage: true,
  validFrom:  true,
  validTo:    true,
  productId:  true,
});
export type DiscountCreate = z.infer<typeof DiscountCreateSchema>;

/**
 * Schema for updating a Discount.
 * All create-fields optional, plus isActive.
 */
export const DiscountUpdateSchema = DiscountCreateSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });
export type DiscountUpdate = z.infer<typeof DiscountUpdateSchema>;
