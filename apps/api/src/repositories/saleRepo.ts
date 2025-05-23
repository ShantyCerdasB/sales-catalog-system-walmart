// apps/api/src/repositories/saleRepo.ts

import { PrismaClient, Sale, SaleItem, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

type Decimal = Prisma.Decimal;

/**
 * Create a new sale along with its line items in a single transaction.
 *
 * @param data.clientId      – optional UUID of the buying client
 * @param data.date          – sale timestamp
 * @param data.subtotal      – sum of line‐item subtotals (≥ 0)
 * @param data.discountTotal – total discount across all items (≥ 0)
 * @param data.total         – grand total after discounts (≥ 0)
 * @param data.paymentMethod – currently only "cash"
 * @param data.items         – array of line‐item inputs
 * @returns the created Sale, including its items
 */
export function createSale(data: {
  clientId?: string | null;
  date: Date;
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: "cash";
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountApplied: number;
  }[];
}): Promise<
  Sale & {
    items: (SaleItem & {
      saleId: string;
      productId: string;
      quantity: number;
      unitPrice: Decimal;
      discountApplied: Decimal;
      createdAt: Date;
      updatedAt: Date;
    })[];
  }
> {
  return prisma.sale.create({
    data: {
      client: data.clientId ? { connect: { id: data.clientId } } : undefined,
      date: data.date,
      subtotal: data.subtotal,
      discountTotal: data.discountTotal,
      total: data.total,
      paymentMethod: data.paymentMethod,
      items: {
        create: data.items.map((item) => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountApplied: item.discountApplied,
        })),
      },
    },
    include: { items: true },
  });
}

/**
 * Retrieve one sale by ID, including its items.
 *
 * @param id – UUID of the sale
 * @returns the Sale with its items, or null if not found
 */
export function getSaleById(
  id: string
): Promise<
  (Sale & {
    items: (SaleItem & {
      saleId: string;
      productId: string;
      quantity: number;
      unitPrice: Decimal;
      discountApplied: Decimal;
      createdAt: Date;
      updatedAt: Date;
    })[];
  }) | null
> {
  return prisma.sale.findUnique({
    where: { id },
    include: { items: true },
  });
}

/**
 * List all sales, optionally filtering by clientId.
 *
 * @param clientId – optional UUID to filter by
 * @returns array of Sale records with their items
 */
export function listSales(
  clientId?: string
): Promise<
  (Sale & {
    items: (SaleItem & {
      saleId: string;
      productId: string;
      quantity: number;
      unitPrice: Decimal;
      discountApplied: Decimal;
      createdAt: Date;
      updatedAt: Date;
    })[];
  })[]
> {
  return prisma.sale.findMany({
    where: clientId ? { clientId } : {},
    orderBy: { date: "desc" },
    include: { items: true },
  });
}

/**
 * Mark a sale as canceled by setting `isCanceled = true`.
 *
 * @param id – UUID of the sale to cancel
 * @returns the updated Sale record
 */
export function cancelSale(id: string): Promise<Sale> {
  return prisma.sale.update({
    where: { id },
    data: { isCanceled: true },
  });
}

/**
 * Permanently delete a sale (and cascade-delete items if configured).
 *
 * @param id – UUID of the sale to delete
 * @returns the deleted Sale record
 */
export function deleteSale(id: string): Promise<Sale> {
  return prisma.sale.delete({
    where: { id },
  });
}
