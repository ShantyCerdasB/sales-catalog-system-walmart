import { v4 as uuidv4 } from 'uuid';
import { SaleRepo } from '../repositories/saleRepo';
import { ProductRepo } from '../repositories/productRepo';
import { DiscountRepo } from '../repositories/discountRepo';
import { ClientRepo } from '../repositories/clientRepo';
import type { SaleCreate, SaleResponse } from '../types/index';

/**
 * Encapsulates business logic for sale processing.
 */
export class SaleService {
  private saleRepo = new SaleRepo();
  private productRepo = new ProductRepo();
  private discountRepo = new DiscountRepo();
  private clientRepo = new ClientRepo();

  /**
   * Creates a new sale record along with its line items.
   * Looks up the client by NIT if provided; use "CF" for anonymous.
   *
   * @param input           Sale creation payload, may include `clientNit`.
   * @param createdById     UUID of the user registering the sale.
   * @returns               The completed SaleResponse.
   * @throws                Error if a referenced product or client is invalid.
   */
  async create(
    input: SaleCreate & { clientNit?: string },
    createdById: string
  ): Promise<SaleResponse> {
    // Determine the actual clientId or null for "CF"
    let clientId: string | null;
    if (input.clientNit) {
      if (input.clientNit === 'CF') {
        clientId = null;
      } else {
        const client = await this.clientRepo.findByNit(input.clientNit);
        if (!client) {
          throw new Error(`Client with NIT '${input.clientNit}' not found`);
        }
        clientId = client.id;
      }
    } else {
      clientId = input.clientId ?? null;
    }

    const saleDate = new Date(input.date);
    let subtotal = 0;
    let discountTotal = 0;
    let total = 0;

    const itemsData: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      discountApplied: number;
    }> = [];

    // Process each line item: validate product, compute discounts
    for (const line of input.items) {
      const product = await this.productRepo.findById(line.productId);
      if (!product || product.isDeleted) {
        throw new Error(`Product '${line.productId}' not available`);
      }

      const unitPrice = Number(product.price);
      const lineSubtotal = unitPrice * line.quantity;

      let lineDiscount = 0;
      const discount = await this.discountRepo.findByProductId(product.id);
      if (
        discount &&
        discount.isActive &&
        saleDate >= discount.validFrom &&
        (!discount.validTo || saleDate <= discount.validTo)
      ) {
        lineDiscount = (lineSubtotal * discount.percentage) / 100;
      }

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
      total += lineSubtotal - lineDiscount;

      itemsData.push({
        id: uuidv4(),
        productId: product.id,
        quantity: line.quantity,
        unitPrice,
        discountApplied: lineDiscount,
      });
    }

    // Perform transactional creation of sale and items
    const created = await this.saleRepo.createWithItems({
      id: uuidv4(),
      clientId,
      date: saleDate,
      subtotal,
      discountTotal,
      total,
      paymentMethod: input.paymentMethod,
      items: itemsData,
      createdById,
    });

    // Fetch full sale including items for response mapping
    const full = await this.saleRepo.findById(created.id);
    return this.mapToResponse(full);
  }

  /**
   * Marks an existing sale as canceled.
   *
   * @param id  UUID of the sale to cancel.
   */
  async cancel(id: string): Promise<void> {
    await this.saleRepo.cancel(id);
  }

  /**
   * Retrieves a single sale by its UUID.
   *
   * @param id  UUID of the sale to fetch.
   * @returns   The SaleResponse.
   */
  async getById(id: string): Promise<SaleResponse> {
    const sale = await this.saleRepo.findById(id);
    return this.mapToResponse(sale);
  }

  /**
   * Lists recent sales with optional pagination.
   *
   * @param opts  Pagination options: skip and take.
   * @returns     Array of SaleResponse objects.
   */
  async list(opts?: { skip?: number; take?: number }): Promise<SaleResponse[]> {
    const sales = await this.saleRepo.listAll(opts);
    return Promise.all(sales.map((s) => this.getById(s.id)));
  }

  /**
   * Transforms a raw DbSale record (including items) into the API response shape.
   *
   * @param s  Raw sale record with nested items.
   * @returns  The SaleResponse ready for clients.
   */
  private mapToResponse(s: any): SaleResponse {
    return {
      id: s.id,
      clientId: s.clientId ?? undefined,
      date: s.date.toISOString(),
      subtotal: Number(s.subtotal),
      discountTotal: Number(s.discountTotal),
      total: Number(s.total),
      paymentMethod: s.paymentMethod,
      isCanceled: s.isCanceled,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      items: s.items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discountApplied: Number(i.discountApplied),
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
    };
  }
}
