import { prismaInstance as prisma } from '../prisma';
import type { Discount as DbDiscount } from '@prisma/client';

/**
 * Provides persistence operations for Discount entities.
 */
export class DiscountRepo {
  /**
   * Creates a new discount record.
   *
   * @param data           The discount data to insert.
   * @param data.id        UUID for the new discount.
   * @param data.code      Unique discount code.
   * @param data.percentage Percentage value between 0 and 100.
   * @param data.validFrom Start date from which the discount applies.
   * @param data.validTo   Optional end date after which the discount expires.
   * @param data.isActive  Whether the discount is active.
   * @param data.productId UUID of the associated product.
   * @param data.createdById Optional UUID of the user creating the discount.
   * @returns              The created Discount record.
   */
  async create(data: {
    id: string;
    code: string;
    percentage: number;
    validFrom: Date;
    validTo?: Date | null;
    isActive: boolean;
    productId: string;
    createdById?: string;
  }): Promise<DbDiscount> {
    return prisma.discount.create({ data });
  }

  /**
   * Retrieves a discount by its primary key.
   *
   * @param id    UUID of the discount to fetch.
   * @returns     The Discount record, or null if not found.
   */
  async findById(id: string): Promise<DbDiscount | null> {
    return prisma.discount.findUnique({ where: { id } });
  }

  /**
   * Finds the discount currently assigned to a given product.
   *
   * @param productId  UUID of the product.
   * @returns          The Discount record, or null if none exists.
   */
  async findByProductId(productId: string): Promise<DbDiscount | null> {
    return prisma.discount.findUnique({ where: { productId } });
  }

  /**
   * Updates specified fields on an existing discount.
   *
   * @param id     UUID of the discount to update.
   * @param data   Partial fields to modify.
   * @returns      The updated Discount record.
   */
  async update(
    id: string,
    data: Partial<{
      code: string;
      percentage: number;
      validFrom: Date;
      validTo: Date | null;
      isActive: boolean;
    }>
  ): Promise<DbDiscount> {
    return prisma.discount.update({ where: { id }, data });
  }

  /**
   * Activates a discount by setting isActive to true.
   *
   * @param id    UUID of the discount to activate.
   * @returns     The updated Discount record.
   */
  async activate(id: string): Promise<DbDiscount> {
    return prisma.discount.update({ where: { id }, data: { isActive: true } });
  }

  /**
   * Deactivates a discount by setting isActive to false.
   *
   * @param id    UUID of the discount to deactivate.
   * @returns     The updated Discount record.
   */
  async deactivate(id: string): Promise<DbDiscount> {
    return prisma.discount.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * Retrieves a paginated list of discounts, optionally filtered by product.
   *
   * @param filters             Filtering and pagination options.
   * @param filters.productId   Optional UUID of a product to filter by.
   * @param filters.skip        Number of records to skip.
   * @param filters.take        Maximum number of records to return.
   * @returns                  Array of Discount records.
   */
  async list(filters?: {
    productId?: string;
    skip?: number;
    take?: number;
  }): Promise<DbDiscount[]> {
    const where = filters?.productId ? { productId: filters.productId } : {};
    return prisma.discount.findMany({
      where,
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
