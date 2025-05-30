import { v4 as uuidv4 } from 'uuid';
import { ProductRepo } from '../repositories/productRepo';
import { DiscountRepo } from '../repositories/discountRepo';
import type {
  ProductCreate,
  ProductUpdate,
  ProductResponse
} from '../types/index';

/**
 * Encapsulates business logic for product management:
 *  - Creating new products
 *  - Fetching single products (with active discount)
 *  - Updating products
 *  - Soft-deleting products
 *  - Listing products with optional filters
 */
export class ProductService {
  private repo = new ProductRepo();
  private discountRepo = new DiscountRepo();

  /**
   * Creates a new product after ensuring its code is unique.
   *
   * @param input        Data for the new product.
   * @param createdById  UUID of the user creating it.
   * @returns            The created product in API response format.
   * @throws             Error if the code is already in use.
   */
  async create(input: ProductCreate, createdById: string): Promise<ProductResponse> {
    const existing = await this.repo.findByCode(input.code);
    if (existing) {
      throw new Error(`Product code '${input.code}' already in use`);
    }

    const raw = await this.repo.create({
      id:          uuidv4(),
      code:        input.code,
      name:        input.name,
      description: input.description ?? null,
      price:       input.price,
      unit:        input.unit,
      createdById,
    });

    return this.mapToResponse(raw);
  }

  /**
   * Retrieves a product by its ID, including its active discount if any.
   *
   * @param id  UUID of the product.
   * @returns   The product in API response format.
   * @throws    Error if no product is found.
   */
  async getById(id: string): Promise<ProductResponse> {
    const raw = await this.repo.findById(id);
    if (!raw) {
      throw new Error(`Product '${id}' not found`);
    }
    return this.mapToResponse(raw);
  }

  /**
   * Updates only the provided fields of an existing product.
   *
   * @param id     UUID of the product to update.
   * @param input  Partial data to apply.
   * @returns      The updated product in API response format.
   */
  async update(id: string, input: ProductUpdate): Promise<ProductResponse> {
    // Pass exactly the incoming fields; leave others undefined
    const raw = await this.repo.update(id, {
      code:        input.code,
      name:        input.name,
      description: input.description,  // undefined if not in `input`
      price:       input.price,
      unit:        input.unit,
    });

    return this.mapToResponse(raw);
  }

  /**
   * Soft-deletes a product (marks as deleted without removing).
   *
   * @param id  UUID of the product.
   */
  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  /**
   * Lists products with optional pagination and filtering.
   *
   * @param opts  Options:
   *   - skip: number of records to skip
   *   - take: max number to return
   *   - includeDeleted: include soft-deleted if true
   *   - code: filter by code substring
   *   - name: filter by name substring
   * @returns     Array of products in API response format.
   */
  async list(opts?: {
    skip?: number;
    take?: number;
    includeDeleted?: boolean;
    code?: string;
    name?: string;
  }): Promise<ProductResponse[]> {
    const raws = await this.repo.list(opts);
    return Promise.all(raws.map(r => this.mapToResponse(r)));
  }

  /**
   * Maps a raw database product record into the API response shape,
   * fetching and embedding its active discount if present.
   *
   * @param p  Raw product record from Prisma.
   */
  private async mapToResponse(p: any): Promise<ProductResponse> {
    const discount = await this.discountRepo.findByProductId(p.id);
    const discountResp = discount && discount.isActive
      ? {
          id:          discount.id,
          code:        discount.code,
          percentage:  discount.percentage,
          validFrom:   discount.validFrom.toISOString(),
          validTo:     discount.validTo?.toISOString() ?? null,
          isActive:    discount.isActive,
          createdAt:   discount.createdAt.toISOString(),
          updatedAt:   discount.updatedAt.toISOString(),
        }
      : undefined;

    return {
      id:          p.id,
      code:        p.code,
      name:        p.name,
      description: p.description ?? undefined,
      price:       p.price,
      unit:        p.unit,
      isDeleted:   p.isDeleted,
      createdAt:   p.createdAt.toISOString(),
      updatedAt:   p.updatedAt.toISOString(),
      discount:    discountResp,
    };
  }
}
