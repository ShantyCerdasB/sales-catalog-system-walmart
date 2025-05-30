// src/services/__tests__/productService.spec.ts

import { ProductService } from '../../services/productService';
import { ProductRepo } from '../../repositories/productRepo';
import { DiscountRepo } from '../../repositories/discountRepo';
import { ProductCreate, ProductUpdate } from '../../types/index';

type MockedProductRepo  = jest.Mocked<ProductRepo>;
type MockedDiscountRepo = jest.Mocked<DiscountRepo>;

jest.mock('../../repositories/productRepo');
jest.mock('../../repositories/discountRepo');

describe('ProductService', () => {
  let service: ProductService;
  let repo:   MockedProductRepo;
  let drepo:  MockedDiscountRepo;

  beforeEach(() => {
    repo  = new ProductRepo()  as MockedProductRepo;
    drepo = new DiscountRepo() as MockedDiscountRepo;
    service = new ProductService();
    // inject mocks
    // @ts-ignore
    service['repo']         = repo;
    // @ts-ignore
    service['discountRepo'] = drepo;
  });

  describe('create()', () => {
    const input: ProductCreate = {
      code: 'X001',
      name: 'Test widget',
      description: 'desc',
      price: 9.99,
      unit: 'unit',
    };

    it('throws if code already exists', async () => {
      repo.findByCode.mockResolvedValue({} as any);
      await expect(service.create(input, 'user-1'))
        .rejects.toThrow("Product code 'X001' already in use");
    });

    it('creates and maps new product', async () => {
      repo.findByCode.mockResolvedValue(null);
      const now = new Date();
      const db = {
        id: 'p1', ...input, createdById: 'user-1',
        isDeleted: false, createdAt: now, updatedAt: now,
      };
      repo.create.mockResolvedValue(db as any);
      drepo.findByProductId.mockResolvedValue(null);

      const out = await service.create(input, 'user-1');
      expect(repo.create).toHaveBeenCalledWith({
        id: expect.any(String),
        code: input.code,
        name: input.name,
        description: input.description,
        price: input.price,
        unit: input.unit,
        createdById: 'user-1',
      });
      expect(out.id).toBe('p1');
      expect(out.discount).toBeUndefined();
    });
  });

  describe('getById()', () => {
    it('throws when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById('p1'))
        .rejects.toThrow("Product 'p1' not found");
    });

    it('returns mapped product with discount', async () => {
      const now = new Date();
      const product = {
        id: 'p1', code: 'C', name: 'N', description: null,
        price: 5, unit: 'u', isDeleted: false,
        createdAt: now, updatedAt: now,
      };
      const discount = {
        id: 'd1', code: 'D', percentage: 20,
        validFrom: now, validTo: null,
        isActive: true, createdAt: now, updatedAt: now,
        productId: 'p1',
      };
      repo.findById.mockResolvedValue(product as any);
      drepo.findByProductId.mockResolvedValue(discount as any);

      const out = await service.getById('p1');
      expect(out.id).toBe('p1');
      expect(out.discount).toMatchObject({ id: 'd1', percentage: 20 });
    });
  });

  describe('update()', () => {
    it('updates and maps result', async () => {
      const now = new Date();
      const updatedDb = {
        id: 'p1', code: 'X', name: 'Y', description: 'd',
        price: 1, unit: 'u', isDeleted: false,
        createdAt: now, updatedAt: now,
      };
      repo.update.mockResolvedValue(updatedDb as any);
      drepo.findByProductId.mockResolvedValue(null);

      const out = await service.update('p1', { name: 'Y' } as ProductUpdate);
      expect(repo.update).toHaveBeenCalledWith('p1', {
        code: undefined,
        name: 'Y',
        description: undefined,
        price: undefined,
        unit: undefined,
      });
      expect(out.name).toBe('Y');
    });
  });

  describe('delete()', () => {
    it('calls softDelete and returns void', async () => {
      repo.softDelete.mockResolvedValue(undefined as any);
      await expect(service.delete('p1')).resolves.toBeUndefined();
      expect(repo.softDelete).toHaveBeenCalledWith('p1');
    });
  });

  describe('list()', () => {
    it('returns mapped array', async () => {
      const now = new Date();
      const dbList = [{
        id: 'p1', code: 'C', name: 'N', description: null,
        price: 2, unit: 'u', isDeleted: false,
        createdAt: now, updatedAt: now,
      }];
      repo.list.mockResolvedValue(dbList as any);
      drepo.findByProductId.mockResolvedValue(null);

      const out = await service.list({ skip:0, take:10 });
      expect(repo.list).toHaveBeenCalledWith({ skip:0, take:10 });
      expect(out[0].id).toBe('p1');
    });
  });
});
