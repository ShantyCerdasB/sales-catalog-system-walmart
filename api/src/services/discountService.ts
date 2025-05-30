import { v4 as uuidv4 } from 'uuid';
import { DiscountRepo } from '../repositories/discountRepo';
import type {
  DiscountCreate,
  DiscountUpdate,
  DiscountResponse
} from '../types/index';

/**
 * Encapsulates business logic for product discounts:
 *  - Creating a discount (one per product)
 *  - Partially updating discounts
 *  - Activating / deactivating
 *  - Fetching single or list of discounts
 */
export class DiscountService {
  private repo = new DiscountRepo();

  /**
   * Creates a new discount for a product, ensuring no other exists.
   *
   * @param input         Fields for the new discount.
   * @param createdById   UUID of the user creating it.
   * @returns             The created discount in response shape.
   * @throws              Error if a discount already exists for that product.
   */
  async create(
    input: DiscountCreate,
    createdById: string
  ): Promise<DiscountResponse> {
    
    if (await this.repo.findByProductId(input.productId)) {
      throw new Error(`Discount already exists for product '${input.productId}'`);
    }

    const record = await this.repo.create({
      id:           uuidv4(),
      code:         input.code,
      percentage:   input.percentage,
      validFrom:    new Date(input.validFrom),
      validTo:      input.validTo ? new Date(input.validTo) : null,
      isActive:     true,
      productId:    input.productId,
      createdById,
    });

    
    return this.mapToResponse(record);
  }

  /**
   * Partially updates an existing discount.
   *
   * @param id     UUID of the discount to update.
   * @param input  Fields to change.
   * @returns      The updated discount in response shape.
   * @throws       Error if no such discount exists.
   */
  async update(
    id: string,
    input: DiscountUpdate
  ): Promise<DiscountResponse> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error(`Discount '${id}' not found`);
    }

    const data: Partial<Record<string, any>> = {};
    if (input.code       !== undefined) data.code       = input.code;
    if (input.percentage !== undefined) data.percentage = input.percentage;
    if (input.validFrom  !== undefined) data.validFrom  = new Date(input.validFrom);
    if (input.validTo    !== undefined) data.validTo    = input.validTo
      ? new Date(input.validTo)
      : null;
    if (input.isActive   !== undefined) data.isActive   = input.isActive;

    const updated = await this.repo.update(id, data);

    return this.mapToResponse(updated);
  }

  /** Activates a discount (sets `isActive = true`). */
  async activate(id: string): Promise<DiscountResponse> {
    const r = await this.repo.activate(id);
    return this.mapToResponse(r);
  }

  /** Deactivates a discount (sets `isActive = false`). */
  async deactivate(id: string): Promise<DiscountResponse> {
    const r = await this.repo.deactivate(id);
    return this.mapToResponse(r);
  }

  /**
   * Retrieves one discount by its UUID.
   *
   * @throws Error if not found.
   */
  async getById(id: string): Promise<DiscountResponse> {
    const r = await this.repo.findById(id);
    if (!r) throw new Error(`Discount '${id}' not found`);
    return this.mapToResponse(r);
  }

  /** Lists all discounts, optionally filtering by productId. */
  async list(productId?: string): Promise<DiscountResponse[]> {
    const arr = await this.repo.list({ productId });
    return arr.map(r => this.mapToResponse(r));
  }

  /**
   * Converts a raw discount record—whose date fields
   * might be `Date`, ISO string, `null` or even `undefined`—
   * into the clean API response shape.
   */
  private mapToResponse(r: any): DiscountResponse {
    // Helper: unify to Date or null
    const toDate = (v: Date | string | null | undefined): Date | null => {
      if (!v) return null;
      return v instanceof Date ? v : new Date(v);
    };

    const validFromDt = toDate(r.validFrom)  || new Date();
    const validToDt   = toDate(r.validTo);
    const createdAtDt = toDate(r.createdAt)  || new Date();
    const updatedAtDt = toDate(r.updatedAt)  || new Date();

    return {
      id:         r.id,
      code:       r.code,
      percentage: r.percentage,
      validFrom:  validFromDt.toISOString(),
      validTo:    validToDt ? validToDt.toISOString() : null,
      isActive:   r.isActive,
      createdAt:  createdAtDt.toISOString(),
      updatedAt:  updatedAtDt.toISOString(),
    };
  }
}
