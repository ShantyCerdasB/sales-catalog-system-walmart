// apps/api/src/repositories/discountRepo.ts

import { PrismaClient, Discount } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new discount for a specific product.
 *
 * @param data.code        – unique discount code
 * @param data.percentage  – discount percentage (0–100)
 * @param data.validFrom   – start date of the discount
 * @param data.validTo     – optional end date of the discount
 * @param data.productId   – UUID of the product to which this discount applies
 * @returns the newly created Discount record
 */
export function createDiscount(data: {
  code: string;
  percentage: number;
  validFrom: Date;
  validTo?: Date | null;
  productId: string;
}): Promise<Discount> {
  return prisma.discount.create({
    data: {
      code: data.code,
      percentage: data.percentage,
      validFrom: data.validFrom,
      validTo: data.validTo ?? null,
      // isActive defaults to true in your schema
      product: { connect: { id: data.productId } },
    },
  });
}

/**
 * List all discounts in the system, most recent first.
 * 
 * @returns an array of Discount records
 */
export function listDiscounts(): Promise<Discount[]> {
  return prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find one discount by its ID.
 *
 * @param id – UUID of the discount to retrieve
 * @returns the Discount record, or null if not found
 */
export function getDiscountById(id: string): Promise<Discount | null> {
  return prisma.discount.findUnique({
    where: { id },
  });
}

/**
 * Update mutable fields of an existing discount.
 *
 * @param id – UUID of the discount to update
 * @param data – partial fields to update
 * @returns the updated Discount record
 */
export function updateDiscount(
  id: string,
  data: {
    code?: string;
    percentage?: number;
    validFrom?: Date;
    validTo?: Date | null;
    isActive?: boolean;
  }
): Promise<Discount> {
  return prisma.discount.update({
    where: { id },
    data: {
      ...data,
    },
  });
}

/**
 * Delete a discount permanently from the database.
 *
 * @param id – UUID of the discount to delete
 * @returns the deleted Discount record
 */
export function deleteDiscount(id: string): Promise<Discount> {
  return prisma.discount.delete({
    where: { id },
  });
}
