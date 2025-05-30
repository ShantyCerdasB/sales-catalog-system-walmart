import { SaleService } from '../../services/saleService';
import { SaleRepo } from '../../repositories/saleRepo';
import { ProductRepo } from '../../repositories/productRepo';
import { DiscountRepo } from '../../repositories/discountRepo';
import { ClientRepo } from '../../repositories/clientRepo';

type Mocked<T> = jest.Mocked<T>;

jest.mock('../../repositories/saleRepo');
jest.mock('../../repositories/productRepo');
jest.mock('../../repositories/discountRepo');
jest.mock('../../repositories/clientRepo');

describe('SaleService', () => {
  let service: SaleService;
  let saleRepo: Mocked<SaleRepo>;
  let prodRepo: Mocked<ProductRepo>;
  let discRepo: Mocked<DiscountRepo>;
  let cliRepo: Mocked<ClientRepo>;
  const today = new Date('2025-05-29T00:00:00.000Z');

  beforeEach(() => {
    saleRepo = new SaleRepo()       as Mocked<SaleRepo>;
    prodRepo = new ProductRepo()    as Mocked<ProductRepo>;
    discRepo = new DiscountRepo()   as Mocked<DiscountRepo>;
    cliRepo  = new ClientRepo()     as Mocked<ClientRepo>;

    service = new SaleService();
    // inject mocks
    // @ts-ignore
    service['saleRepo']    = saleRepo;
    // @ts-ignore
    service['productRepo'] = prodRepo;
    // @ts-ignore
    service['discountRepo']= discRepo;
    // @ts-ignore
    service['clientRepo']  = cliRepo;
  });

  describe('create()', () => {
    const baseInput = {
      date: today.toISOString(),
      subtotal: 0,
      discountTotal: 0,
      total: 0,
      paymentMethod: 'cash' as const,
      items: [{
        productId: 'p1',
        quantity: 2,
        unitPrice: 5,
        discountApplied: 0
      }]
    };

    it('throws if product is missing or deleted', async () => {
      prodRepo.findById.mockResolvedValue(null);
      await expect(service.create({ ...baseInput }, 'u1'))
        .rejects.toThrow("Product 'p1' not available");
    });

    it('throws if client NIT not found', async () => {
      // let product exist
      prodRepo.findById.mockResolvedValue({ id:'p1', price:5, isDeleted:false } as any);
      // simulate client lookup
      await expect(service.create({ ...baseInput, clientNit: '12345' }, 'u1'))
        .rejects.toThrow("Client with NIT '12345' not found");
    });

    it('calculates totals, applies discounts, and returns mapped SaleResponse', async () => {
      // product present
      prodRepo.findById.mockResolvedValue({
        id:'p1', price:5, isDeleted:false
      } as any);
      // no discount
      discRepo.findByProductId.mockResolvedValue(null);
      // saleRepo.createWithItems returns minimal created record
      saleRepo.createWithItems.mockResolvedValue({ id:'s1' } as any);
      // saleRepo.findById returns full structure
      saleRepo.findById.mockResolvedValue({
        id:'s1',
        clientId: null,
        date: today,
        subtotal: 10,
        discountTotal: 0,
        total: 10,
        paymentMethod: 'cash',
        isCanceled: false,
        createdAt: today,
        updatedAt: today,
        items: [{
          id: 'i1',
          productId: 'p1',
          quantity: 2,
          unitPrice: 5,
          discountApplied: 0,
          createdAt: today,
          updatedAt: today
        }]
      } as any);

      const result = await service.create(baseInput, 'u1');
      expect(saleRepo.createWithItems).toHaveBeenCalled();
      expect(result.id).toBe('s1');
      expect(result.subtotal).toBe(10);
      expect(result.items[0].quantity).toBe(2);
    });
  });

  describe('cancel()', () => {
    it('invokes saleRepo.cancel', async () => {
      saleRepo.cancel.mockResolvedValue(undefined as any);
      await expect(service.cancel('s1')).resolves.toBeUndefined();
      expect(saleRepo.cancel).toHaveBeenCalledWith('s1');
    });
  });

  describe('getById() and list()', () => {
    it('maps a single sale via mapToResponse', async () => {
      const full = { id:'s1', clientId:null, date:today, subtotal:0, discountTotal:0, total:0,
        paymentMethod:'cash', isCanceled:false, createdAt:today, updatedAt:today, items:[] };
      saleRepo.findById.mockResolvedValue(full as any);
      const out = await service.getById('s1');
      expect(out.id).toBe('s1');
    });

    it('list() fetches IDs then calls getById', async () => {
      saleRepo.listAll.mockResolvedValue([{ id:'s1' }] as any);
      saleRepo.findById.mockResolvedValue({
        id:'s1', clientId:null, date:today, subtotal:0, discountTotal:0, total:0,
        paymentMethod:'cash', isCanceled:false, createdAt:today, updatedAt:today, items:[]
      } as any);

      const arr = await service.list({ skip:0, take:1 });
      expect(saleRepo.listAll).toHaveBeenCalledWith({ skip:0, take:1 });
      expect(arr[0].id).toBe('s1');
    });
  });
});
