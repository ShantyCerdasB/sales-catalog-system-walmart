import { SaleItemService } from '../../services/saleItemService';
import { SaleItemRepo } from '../../repositories/saleItemRepo';
import type { SaleItemResponse } from '../../types/index';

type MockedSaleItemRepo = jest.Mocked<SaleItemRepo>;

jest.mock('../../repositories/saleItemRepo');

describe('SaleItemService', () => {
  let service: SaleItemService;
  let repo:    MockedSaleItemRepo;

  beforeEach(() => {
    repo = new SaleItemRepo() as MockedSaleItemRepo;
    service = new SaleItemService();
    // inject mock
    // @ts-ignore
    service['repo'] = repo;
  });

  it('converts DB items to API format', async () => {
    const now = new Date();
    const dbItems = [{
      id: 'i1', saleId:'s1', productId:'p1',
      quantity:2, unitPrice:'5', discountApplied:'1',
      createdAt: now, updatedAt: now,
    }];
    repo.findBySaleId.mockResolvedValue(dbItems as any);

    const out = await service.getBySaleId('s1');
    expect(repo.findBySaleId).toHaveBeenCalledWith('s1');
    expect(out[0]).toEqual({
      id: 'i1',
      productId: 'p1',
      quantity: 2,
      unitPrice: 5,
      discountApplied: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } as SaleItemResponse);
  });
});
