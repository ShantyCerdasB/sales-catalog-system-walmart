// apps/api/src/services/discountService.ts

import type {
  DiscountCreate,
  DiscountUpdate,
  DiscountResponse,
} from "@sales-catalog/types";
import { Discount } from "@prisma/client";
import {
  createDiscount as repoCreate,
  listDiscounts as repoList,
  getDiscountById as repoGet,
  updateDiscount as repoUpdate,
  deleteDiscount as repoDelete,
} from "../repositories/discountRepo";
import { DiscountResponseSchema } from "@sales-catalog/types/discount";

/**
 * Map a Prisma Discount record into our API response shape.
 */
function mapDiscount(d: Discount): DiscountResponse {
  return {
    id: d.id,
    code: d.code,
    percentage: d.percentage,
    validFrom: d.validFrom.toISOString(),
    validTo: d.validTo?.toISOString() ?? null,
    isActive: d.isActive,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export const discountService = {
  /**
   * Create a new discount.
   *
   * @param input – raw input to validate against DiscountCreateSchema
   * @returns the created discount in API response format
   */
  async create(input: unknown): Promise<DiscountResponse> {
    // Validate & cast
    const data = (await import("@sales-catalog/types"))
      .DiscountCreateSchema.parse(input) as DiscountCreate;

    const created = await repoCreate({
      code: data.code,
      percentage: data.percentage,
      validFrom: new Date(data.validFrom),
      validTo: data.validTo ? new Date(data.validTo) : null,
      productId: data.productId,
    });

    const result = mapDiscount(created);
    // Validate shape (optional)
    return DiscountResponseSchema.parse(result);
  },

  /**
   * List all discounts.
   *
   * @returns an array of discounts in API response format
   */
  async list(): Promise<DiscountResponse[]> {
    const list = await repoList();
    return list.map(mapDiscount).map((d) => DiscountResponseSchema.parse(d));
  },

  /**
   * Get a single discount by ID.
   *
   * @param id – UUID of the discount to retrieve
   * @throws Error if not found
   * @returns the found discount in API response format
   */
  async get(id: string): Promise<DiscountResponse> {
    const found = await repoGet(id);
    if (!found) throw new Error("Discount not found");
    const result = mapDiscount(found);
    return DiscountResponseSchema.parse(result);
  },

  /**
   * Update mutable fields of an existing discount.
   *
   * @param id – UUID of the discount to update
   * @param input – raw input to validate against DiscountUpdateSchema
   * @throws Error if not found
   * @returns the updated discount in API response format
   */
  async update(id: string, input: unknown): Promise<DiscountResponse> {
    // Ensure it exists
    await this.get(id);

    const data = (await import("@sales-catalog/types"))
      .DiscountUpdateSchema.parse(input) as DiscountUpdate;

    const updated = await repoUpdate(id, {
      ...("code" in data ? { code: data.code } : {}),
      ...("percentage" in data ? { percentage: data.percentage } : {}),
      ...("validFrom" in data ? { validFrom: new Date(data.validFrom!) } : {}),
      ...("validTo" in data
        ? { validTo: data.validTo ? new Date(data.validTo) : null }
        : {}),
      ...("isActive" in data ? { isActive: data.isActive } : {}),
    });

    const result = mapDiscount(updated);
    return DiscountResponseSchema.parse(result);
  },

  /**
   * Delete a discount permanently.
   *
   * @param id – UUID of the discount to delete
   * @throws Error if not found
   */
  async remove(id: string): Promise<void> {
    // Ensure it exists
    await this.get(id);
    await repoDelete(id);
  },
};
