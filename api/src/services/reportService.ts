import { ReportRepo } from '../repositories/reportRepo';
import { ProductRepo } from '../repositories/productRepo';
import { ClientRepo } from '../repositories/clientRepo';
import type {
  ProductResponse,
  ClientResponse
} from  '../types/index';

export class ReportService {
  private reportRepo = new ReportRepo();
  private productRepo = new ProductRepo();
  private clientRepo = new ClientRepo();

  /**
   * Fetches top products by units sold.
   * @param limit   how many to return
   * @param fromDt  start date (must be a Date instance)
   * @param toDt    end date   (must be a Date instance)
   */
  async getTopProducts(
    limit = 10,
    fromDt?: Date,
    toDt?: Date
  ): Promise<Array<{ product: ProductResponse; totalUnits: number }>> {
    const rows = await this.reportRepo.topProductsByUnits(limit, fromDt, toDt);

    return Promise.all(
      rows.map(async ({ productId, totalUnits }) => {
        const p = await this.productRepo.findById(productId);
        if (!p) throw new Error(`Product '${productId}' not found`);

        return {
          product: {
            id:          p.id,
            code:        p.code,
            name:        p.name,
            description: p.description ?? undefined,
            price:       Number(p.price),
            unit:        p.unit,
            isDeleted:   p.isDeleted,
            createdAt:   p.createdAt.toISOString(),
            updatedAt:   p.updatedAt.toISOString(),
            discount:    undefined
          },
          totalUnits
        };
      })
    );
  }

  /**
   * Fetches top clients by transaction count.
   * @param limit   how many to return
   * @param fromDt  start date (must be a Date instance)
   * @param toDt    end date   (must be a Date instance)
   */
 

  async getTopClients(
    limit = 5,
    fromDt?: Date,
    toDt?: Date
  ): Promise<Array<{ client: ClientResponse; transactionCount: number }>> {
    const rows = await this.reportRepo.topClientsByTransactionCount(limit, fromDt, toDt);

    return Promise.all(
      rows.map(async ({ clientId, transactionCount }) => {
        const c = await this.clientRepo.findById(clientId);
        if (!c) throw new Error(`Client '${clientId}' not found`);

        const client: ClientResponse = {
          id:        c.id,
          code:      c.code,
          name:      c.name,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          nit:       c.nit,
          email:     c.email,  // string | null | undefined
          phone:     c.phone   // string | null | undefined
        };

        return { client, transactionCount };
      })
    );
  }
}
