// apps/api/src/services/saleService.ts

import type {
  SaleCreate,
  SaleResponse,
  SaleCancel,
} from "@sales-catalog/types/sale";
import {
  SaleCreateSchema,
  SaleCancelSchema,
  SaleResponseSchema,
} from "@sales-catalog/types/sale";
import { Prisma, Sale, SaleItem } from "@prisma/client";
import {
  createSale as repoCreate,
  listSales as repoList,
  getSaleById as repoGet,
  cancelSale as repoCancel,
  deleteSale as repoDelete,
} from "../repositories/saleRepo";

type Decimal = Prisma.Decimal;

/**
 * Map a Prisma Sale + nested items into our API response shape.
 */
function mapSale(s: Sale & { items: SaleItem[] }): SaleResponse {
  return {
    id: s.id,
    clientId: s.clientId ?? undefined,
    date: s.date.toISOString(),
    subtotal: (s.subtotal as Decimal).toNumber(),
    discountTotal: (s.discountTotal as Decimal).toNumber(),
    total: (s.total as Decimal).toNumber(),
    paymentMethod: s.paymentMethod,
    isCanceled: s.isCanceled,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    items: s.items.map(i => ({
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: (i.unitPrice as Decimal).toNumber(),
      discountApplied: (i.discountApplied as Decimal).toNumber(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
  };
}

export const saleService = {
  /**
   * Create a new sale with its items.
   */
  async create(input: unknown, items: any): Promise<SaleResponse> {
    const data = SaleCreateSchema.parse(input) as SaleCreate;

    // Convert dates and pass items array
    const created = await repoCreate({
      clientId: data.clientId ?? null,
      date: new Date(data.date),
      subtotal: data.subtotal,
      discountTotal: data.discountTotal,
      total: data.total,
      paymentMethod: data.paymentMethod,
      items: data.items.map((i: { productId: any; quantity: any; unitPrice: any; discountApplied: any; }) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountApplied: i.discountApplied,
      })),
    });

    return SaleResponseSchema.parse(mapSale(created));
  },

  /**
   * List all sales (unfiltered).
   */
  async list(): Promise<SaleResponse[]> {
    const list = await repoList();
    return list.map(s => SaleResponseSchema.parse(mapSale(s)));
  },

  /**
   * Get one sale by ID.
   */
  async get(id: string): Promise<SaleResponse> {
    const found = await repoGet(id);
    if (!found) throw new Error("Sale not found");
    return SaleResponseSchema.parse(mapSale(found));
  },

  /**
   * Mark a sale as canceled.
   */
  async cancel(id: string): Promise<SaleResponse> {
    // ensure existence
    const before = await repoGet(id);
    if (!before) throw new Error("Sale not found");

    const updated = await repoCancel(id);
    // fetch with items
    const withItems = await repoGet(id);
    return SaleResponseSchema.parse(mapSale(withItems!));
  },

  /**
   * Permanently delete a sale.
   */
  async remove(id: string): Promise<void> {
    const before = await repoGet(id);
    if (!before) throw new Error("Sale not found");
    await repoDelete(id);
  },
};
