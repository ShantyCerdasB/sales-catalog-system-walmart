import { prismaInstance as prisma } from '../prisma';
import type { Sale as DbSale } from '@prisma/client';

/**
 * Provides persistence operations for Sale entities, including transactional creation with items.
 */
export class SaleRepo {
  /**
   * Creates a sale along with its associated sale items in a single database transaction.
   *
   * @param data                       The sale and items data.
   * @param data.id                    UUID for the new sale.
   * @param data.clientId              Optional UUID of the associated client (null for anonymous).
   * @param data.date                  Date and time of the sale.
   * @param data.subtotal              Sum of line subtotals (unitPrice * quantity).
   * @param data.discountTotal         Sum of all discounts applied.
   * @param data.total                 Final total after discounts.
   * @param data.paymentMethod         Must be `"cash"` per requirements.
   * @param data.items                 Array of sale item entries.
   * @param data.items[].id            UUID for each sale item.
   * @param data.items[].productId     UUID of the product sold.
   * @param data.items[].quantity      Number of units sold.
   * @param data.items[].unitPrice     Unit sale price.
   * @param data.items[].discountApplied Discount amount applied to that line.
   * @param data.createdById           Optional UUID of the user who created the sale.
   * @returns                          The created Sale record (without items).
   */
  async createWithItems(data: {
    id: string;
    clientId?: string | null;
    date: Date;
    subtotal: number;
    discountTotal: number;
    total: number;
    paymentMethod: 'cash';
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      discountApplied: number;
    }>;
    createdById?: string;
  }): Promise<DbSale> {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          id: data.id,
          clientId: data.clientId,
          date: data.date,
          subtotal: data.subtotal,
          discountTotal: data.discountTotal,
          total: data.total,
          paymentMethod: data.paymentMethod,
          createdById: data.createdById,
        },
      });

      const items = data.items.map(item => ({
        ...item,
        saleId: sale.id,
      }));

      await tx.saleItem.createMany({ data: items });

      return sale;
    });
  }

  /**
   * Retrieves a sale by its UUID, including all associated sale items.
   * Throws if no matching record is found.
   *
   * @param id    UUID of the sale to fetch.
   * @returns     The Sale record with an `items` array.
   */
  async findById(id: string): Promise<DbSale & { items: any[] }> {
    return prisma.sale.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
  }

  /**
   * Marks a sale as canceled by setting `isCanceled` to true.
   *
   * @param id    UUID of the sale to cancel.
   */
  async cancel(id: string): Promise<void> {
    await prisma.sale.update({
      where: { id },
      data: { isCanceled: true },
    });
  }

  /**
   * Retrieves a paginated list of sales, ordered by date descending.
   *
   * @param opts   Pagination options.
   * @param opts.skip Number of records to skip.
   * @param opts.take Maximum number of records to return.
   * @returns      Array of Sale records (without items).
   */
  async listAll(opts?: { skip?: number; take?: number }): Promise<DbSale[]> {
    return prisma.sale.findMany({
      skip: opts?.skip,
      take: opts?.take,
      orderBy: { date: 'desc' },
    });
  }
}
