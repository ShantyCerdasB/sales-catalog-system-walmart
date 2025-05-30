import { prismaInstance as prisma } from '../prisma';
import type { SaleItem as DbSaleItem } from '@prisma/client';

/**
 * Handles persistence operations for SaleItem entities.
 */
export class SaleItemRepo {
  /**
   * Inserts multiple sale items in a batch and returns the created records.
   *
   * @param items  Array of sale item data to insert.
   * @param items[].id               UUID for the sale item.
   * @param items[].saleId           UUID of the parent sale.
   * @param items[].productId        UUID of the product.
   * @param items[].quantity         Number of units sold.
   * @param items[].unitPrice        Sale price per unit.
   * @param items[].discountApplied  Discount amount applied to this line.
   * @returns       Array of inserted SaleItem records.
   */
  async createMany(
    items: Array<{
      id: string;
      saleId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      discountApplied: number;
    }>
  ): Promise<DbSaleItem[]> {
    await prisma.saleItem.createMany({ data: items });
    return prisma.saleItem.findMany({ where: { saleId: items[0]?.saleId } });
  }

  /**
   * Retrieves all sale items belonging to a specific sale.
   *
   * @param saleId  UUID of the sale whose items to fetch.
   * @returns       Array of SaleItem records.
   */
  async findBySaleId(saleId: string): Promise<DbSaleItem[]> {
    return prisma.saleItem.findMany({ where: { saleId } });
  }

  /**
   * Deletes all sale items for a given sale.
   *
   * @param saleId  UUID of the sale whose items should be removed.
   */
  async deleteBySaleId(saleId: string): Promise<void> {
    await prisma.saleItem.deleteMany({ where: { saleId } });
  }
}
