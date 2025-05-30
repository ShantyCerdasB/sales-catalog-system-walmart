import { prismaInstance as prisma } from '../prisma';

/**
 * Represents a product’s total units sold.
 */
export interface TopProduct {
  /** UUID of the product. */
  productId: string;
  /** Sum of units sold for this product. */
  totalUnits: number;
}

/**
 * Represents a client’s total transaction count.
 */
export interface TopClient {
  /** UUID of the client. */
  clientId: string;
  /** Number of completed sales for this client. */
  transactionCount: number;
}

/**
 * Provides aggregation queries for reporting purposes.
 */
export class ReportRepo {
  /**
   * Returns the top N products by total units sold within an optional date range.
   *
   * @param limit   Maximum number of products to return.
   * @param from    Optional lower bound for sale date (inclusive).
   * @param to      Optional upper bound for sale date (inclusive).
   * @returns       Array of TopProduct entries sorted by totalUnits descending.
   */
  async topProductsByUnits(
    limit: number,
    from?: Date,
    to?: Date
  ): Promise<TopProduct[]> {
    const results = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        sale: {
          date: {
            gte: from,
            lte: to
          }
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit
    });

    return results.map(r => ({
      productId: r.productId,
      totalUnits: r._sum.quantity ?? 0
    }));
  }

  /**
   * Returns the top N clients by number of transactions within an optional date range.
   *
   * @param limit   Maximum number of clients to return.
   * @param from    Optional lower bound for sale date (inclusive).
   * @param to      Optional upper bound for sale date (inclusive).
   * @returns       Array of TopClient entries sorted by transactionCount descending.
   */
  async topClientsByTransactionCount(
    limit: number,
    from?: Date,
    to?: Date
  ): Promise<TopClient[]> {
    const results = await prisma.sale.groupBy({
      by: ['clientId'],
      _count: { id: true },
      where: {
        clientId: { not: null },
        date: {
          gte: from,
          lte: to
        }
      },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    return results.map(r => ({
      clientId: r.clientId!,
      transactionCount: r._count.id
    }));
  }
}
