import { DiscountService } from '../../services/discountService';
import { DiscountRepo } from '../../repositories/discountRepo';
import { DiscountCreate, DiscountUpdate } from '../../types/index';

type MockedDiscountRepo = jest.Mocked<DiscountRepo>;

jest.mock('../../repositories/discountRepo');

describe('DiscountService', () => {
  let service: DiscountService;
  let repo: MockedDiscountRepo;
  const now = new Date('2025-01-01T00:00:00.000Z');

  beforeEach(() => {
    (DiscountRepo as jest.Mock).mockClear();
    repo = new DiscountRepo() as MockedDiscountRepo;
    service = new DiscountService();
    // inject mock
    // @ts-ignore
    service['repo'] = repo;
  });

  describe('create()', () => {
    const input: DiscountCreate = {
      code: 'DISC10',
      percentage: 10,
      validFrom: '2025-01-01T00:00:00.000Z',
      validTo: null,
      productId: 'prod-123',
    };

    it('creates a new discount when none exists', async () => {
      repo.findByProductId.mockResolvedValue(null);
      const dbRecord: any = {
        id: 'd1',
        ...input,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      repo.create.mockResolvedValue(dbRecord);

      const out = await service.create(input, 'user-1');
      expect(repo.findByProductId).toHaveBeenCalledWith('prod-123');
      expect(repo.create).toHaveBeenCalled();
      expect(out).toEqual({
        id: 'd1',
        code: 'DISC10',
        percentage: 10,
        validFrom: now.toISOString(),
        validTo: null,
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });

    it('throws error if discount already exists', async () => {
      repo.findByProductId.mockResolvedValue({} as any);
      await expect(service.create(input, 'user-1'))
        .rejects.toThrow("Discount already exists for product 'prod-123'");
    });
  });

  describe('update()', () => {
    it('applies partial updates', async () => {
      repo.findById.mockResolvedValue({ id: 'd1' } as any);
      repo.update.mockResolvedValue({ id: 'd1', code: 'NEW' } as any);

      const out = await service.update('d1', { code: 'NEW' } as DiscountUpdate);
      expect(repo.findById).toHaveBeenCalledWith('d1');
      expect(repo.update).toHaveBeenCalledWith('d1', { code: 'NEW' });
      expect(out.code).toBe('NEW');
    });

    it('throws when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('d1', {} as DiscountUpdate))
        .rejects.toThrow("Discount 'd1' not found");
    });
  });

  describe('activate() / deactivate()', () => {
    it('activate() calls repo.activate', async () => {
      repo.activate.mockResolvedValue({ id: 'd1', isActive: true, createdAt: now, updatedAt: now, code:'C', percentage:0, validFrom:now, validTo:null } as any);
      const out = await service.activate('d1');
      expect(repo.activate).toHaveBeenCalledWith('d1');
      expect(out.isActive).toBe(true);
    });

    it('deactivate() calls repo.deactivate', async () => {
      repo.deactivate.mockResolvedValue({ id: 'd1', isActive: false, createdAt: now, updatedAt: now, code:'C', percentage:0, validFrom:now, validTo:null } as any);
      const out = await service.deactivate('d1');
      expect(repo.deactivate).toHaveBeenCalledWith('d1');
      expect(out.isActive).toBe(false);
    });
  });

  describe('getById()', () => {
    it('returns mapped record', async () => {
      const record: any = {
        id: 'd1',
        code: 'X',
        percentage: 5,
        validFrom: now,
        validTo: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      repo.findById.mockResolvedValue(record);
      const out = await service.getById('d1');
      expect(repo.findById).toHaveBeenCalledWith('d1');
      expect(out.id).toBe('d1');
    });

    it('throws error when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById('d1'))
        .rejects.toThrow("Discount 'd1' not found");
    });
  });

  describe('list()', () => {
    it('returns all mapped discounts', async () => {
      const record: any = {
        id: 'd1',
        code: 'X',
        percentage: 0,
        validFrom: now,
        validTo: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      repo.list.mockResolvedValue([record]);
      const out = await service.list('prod-123');
      expect(repo.list).toHaveBeenCalledWith({ productId: 'prod-123' });
      expect(out[0].id).toBe('d1');
    });
  });
});
