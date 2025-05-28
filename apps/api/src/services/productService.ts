// apps/api/src/services/productService.ts

import type {
  ProductCreate,
  ProductUpdate,
  ProductResponse,
} from "@sales-catalog/types";
import { Prisma, Discount, Product } from "@prisma/client";
import {
  createProduct as repoCreate,
  listProducts as repoList,
  getProductById as repoGet,
  updateProduct as repoUpdate,
  deleteProduct as repoDelete,
} from "../repositories/productRepo";

type Decimal = Prisma.Decimal;

/**
 * Map a Prisma Product + Discount into our API response shape.
 */
function mapProduct(p: Product & { discount: Discount | null }): ProductResponse {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description ?? undefined,
    price: (p.price as Prisma.Decimal).toNumber(),
    unit: p.unit,
    isDeleted: p.isDeleted,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    discount: p.discount
      ? {
          id: p.discount.id,
          code: p.discount.code,
          percentage: p.discount.percentage,
          validFrom: p.discount.validFrom.toISOString(),
          validTo: p.discount.validTo?.toISOString() ?? null,
          isActive: p.discount.isActive,
          createdAt: p.discount.createdAt.toISOString(),
          updatedAt: p.discount.updatedAt.toISOString(),
        }
      : undefined,
  };
}


export const productService = {
  /**
   * Create a new product on behalf of the given user.
   *
   * @param input – raw input to validate against ProductCreateSchema
   * @param userId – ID of the user creating this product
   * @returns the created product in API response format
   */
  async create(input: unknown, userId: string): Promise<ProductResponse> {
    const data = (await import("@sales-catalog/types"))
      .ProductCreateSchema.parse(input) as ProductCreate;

    const created = await repoCreate({ ...data, createdById: userId });
    return mapProduct(created);
  },

  /**
   * List all non-deleted products.
   *
   * @returns an array of products in API response format
   */
  async list(): Promise<ProductResponse[]> {
    const list = await repoList();
    return list.map(mapProduct);
  },

  /**
   * Get a single product by its ID.
   *
   * @param id – UUID of the product to retrieve
   * @throws Error if product not found
   * @returns the found product in API response format
   */
  async get(id: string): Promise<ProductResponse> {
    const found = await repoGet(id);
    if (!found) throw new Error("Product not found");
    return mapProduct(found);
  },

  /**
   * Update mutable fields of an existing product.
   *
   * @param id – UUID of the product to update
   * @param input – raw input to validate against ProductUpdateSchema
   * @throws Error if product not found
   * @returns the updated product in API response format
   */
  async update(id: string, input: unknown): Promise<ProductResponse> {
    await this.get(id);  // ensure it exists

    const data = (await import("@sales-catalog/types"))
      .ProductUpdateSchema.parse(input) as ProductUpdate;

    const updated = await repoUpdate(id, data);
    return mapProduct(updated);
  },

  /**
   * Soft-delete a product by setting its `isDeleted` flag.
   *
   * @param id – UUID of the product to remove
   * @throws Error if product not found
   */
  async remove(id: string): Promise<void> {
    await this.get(id);
    await repoDelete(id);
  },
};
