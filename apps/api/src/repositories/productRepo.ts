// apps/api/src/repositories/productRepo.ts
import { PrismaClient, Product, Discount } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a new product (soft-deleted = false by default).
 * @param data – fields + createdById
 */
export function createProduct(data: {
  code: string;
  name: string;
  description?: string | null;
  price: number;
  unit: string;
  createdById: string;
}): Promise<Product & { discount: Discount | null }> {
  return prisma.product.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      unit: data.unit,
      createdBy: { connect: { id: data.createdById } },
    },
    include: { discount: true },
  });
}

/**
 * List all non-deleted products, newest first.
 */
export function listProducts(): Promise<(Product & { discount: Discount | null })[]> {
  return prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { discount: true },
  });
}

/**
 * Get one non-deleted product by ID.
 */
export function getProductById(
  id: string
): Promise<(Product & { discount: Discount | null }) | null> {
  return prisma.product.findFirst({
    where: { id, isDeleted: false },
    include: { discount: true },
  });
}

/**
 * Update a product’s mutable fields.
 */
export function updateProduct(
  id: string,
  data: {
    code?: string;
    name?: string;
    description?: string | null;
    price?: number;
    unit?: string;
  }
): Promise<Product & { discount: Discount | null }> {
  return prisma.product.update({
    where: { id },
    data: { ...data },
    include: { discount: true },
  });
}

/**
 * Soft-delete a product.
 */
export function deleteProduct(id: string): Promise<Product> {
  return prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
}
