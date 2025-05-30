import { SaleItemRepo } from '../repositories/saleItemRepo';
import type { SaleItemResponse } from '../types/index';

export class SaleItemService {
  private repo = new SaleItemRepo();

  /**
   * Retrieves all items associated with a specific sale.
   *
   * @param saleId   UUID of the sale whose items are requested.
   * @returns        Array of sale items in API response format.
   */
  async getBySaleId(saleId: string): Promise<SaleItemResponse[]> {
    const items = await this.repo.findBySaleId(saleId);

    return items.map(i => ({
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      discountApplied: Number(i.discountApplied),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }));
  }
}
