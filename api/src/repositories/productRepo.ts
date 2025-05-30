import { prismaInstance as prisma } from '../prisma';
import type { Product as DbProduct } from '@prisma/client';

/**
 * Provides persistence operations for Product entities.
 */
export class ProductRepo {
  /**
   * Creates a new product record.
   *
   * @param data              The product data to insert.
   * @param data.id           UUID for the new product.
   * @param data.code         Unique alphanumeric product code.
   * @param data.name         Name of the product.
   * @param data.description  Optional description text.
   * @param data.price        Unit sale price.
   * @param data.unit         Unit of measure (e.g. "kg", "unit").
   * @param data.createdById  Optional UUID of the user creating the product.
   * @returns                 The created Product record.
   */
  async create(data: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    price: number;
    unit: string;
    createdById?: string;
  }): Promise<DbProduct> {
    return prisma.product.create({ data });
  }

  /**
   * Finds a product by its unique code.
   *
   * @param code  The unique product code to search for.
   * @returns     The Product record, or null if not found.
   */
  async findByCode(code: string): Promise<DbProduct | null> {
    return prisma.product.findUnique({ where: { code } });
  }

  /**
   * Retrieves a product by its UUID.
   *
   * @param id    The UUID of the product.
   * @returns     The Product record, or null if not found.
   */
  async findById(id: string): Promise<DbProduct | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  /**
   * Updates specified fields on an existing product.
   *
   * @param id    The UUID of the product to update.
   * @param data  Partial product fields to modify.
   * @returns     The updated Product record.
   */
  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      description: string | null;
      price: number;
      unit: string;
    }>
  ): Promise<DbProduct> {
    return prisma.product.update({ where: { id }, data });
  }

  /**
   * Marks a product as deleted without removing the record.
   *
   * @param id  The UUID of the product to soft-delete.
   * @returns   The updated Product record (isDeleted = true).
   */
  async softDelete(id: string): Promise<DbProduct> {
    return prisma.product.update({ where: { id }, data: { isDeleted: true } });
  }

  /**
   * Retrieves a list of products with optional filtering and pagination.
   *
   * @param filters              Filtering and pagination options.
   * @param filters.skip         Number of records to skip.
   * @param filters.take         Maximum number of records to return.
   * @param filters.includeDeleted Whether to include soft-deleted records.
   * @param filters.code         Optional code substring filter (case-insensitive).
   * @param filters.name         Optional name substring filter (case-insensitive).
   * @returns                    Array of Product records.
   */
  async list(filters: {
    skip?: number;
    take?: number;
    includeDeleted?: boolean;
    code?: string;
    name?: string;
  } = {}): Promise<DbProduct[]> {
    const { skip, take, includeDeleted, code, name } = filters;
    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }
    if (code) {
      where.code = { contains: code, mode: 'insensitive' };
    }
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    return prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
