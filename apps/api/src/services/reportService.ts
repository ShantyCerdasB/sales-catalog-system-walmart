// apps/api/src/services/reportService.ts
import { prisma } from '../prisma';

/**
 * ReportService
 *
 * Generates:
 *  • Top N products by units sold or revenue in a date range.
 *  • Top N clients by number of transactions in a date range.
 */
export const reportService = {
  /**
   * Top products.
   * @param limit  Number of products to return.
   * @param by     'units' or 'revenue'.
   * @param from   ISO date string.
   * @param to     ISO date string.
   */
  async topProducts(
    limit: number,
    by: 'units' | 'revenue',
    from: string,
    to: string
  ) {
    const groups = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          date: { gte: new Date(from), lte: new Date(to) },
          isCanceled: false,
        },
      },
      _sum: {
        quantity: true,
        unitPrice: true,
        discountApplied: true,
      },
    });

    // Compute metric and sort
    const withMetric = groups.map(item => {
      const qty = item._sum.quantity ?? 0;
      const up = item._sum.unitPrice ?? 0;
      const disc = item._sum.discountApplied ?? 0;
      // revenue = sum(unitPrice * quantity) - sum(discountApplied)
      const revenue = Number(up) * Number(qty) - Number(disc);
      return {
        productId: item.productId,
        units: qty,
        revenue,
      };
    });

    // Sort by desired metric desc
    withMetric.sort((a, b) => (by === 'units' ? b.units - a.units : b.revenue - a.revenue));

    return withMetric.slice(0, limit).map(x => ({
      productId: x.productId,
      metric: by === 'units' ? x.units : x.revenue,
    }));
  },

  /**
   * Top clients.
   * @param limit  Number of clients.
   * @param from   ISO date string.
   * @param to     ISO date string.
   */
  async topClients(limit: number, from: string, to: string) {
    const groups = await prisma.sale.groupBy({
      by: ['clientId'],
      where: {
        date: { gte: new Date(from), lte: new Date(to) },
        isCanceled: false,
        clientId: { not: null },
      },
      _count: { id: true },
    });

    // Filter out any null (though `where` excludes null) and sort 
    const list = groups
      .map(c => ({ clientId: c.clientId!, transactions: c._count.id }))
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, limit);

    return list;
  },
};
