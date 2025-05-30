import { ReportService } from '../../services/reportService';
import { ReportRepo } from '../../repositories/reportRepo';
import { ProductRepo } from '../../repositories/productRepo';
import { ClientRepo } from '../../repositories/clientRepo';

type MockedReportRepo  = jest.Mocked<ReportRepo>;
type MockedProductRepo = jest.Mocked<ProductRepo>;
type MockedClientRepo  = jest.Mocked<ClientRepo>;

jest.mock('../../repositories/reportRepo');
jest.mock('../../repositories/productRepo');
jest.mock('../../repositories/clientRepo');

describe('ReportService', () => {
  let service: ReportService;
  let rrepo:   MockedReportRepo;
  let prepo:   MockedProductRepo;
  let crepo:   MockedClientRepo;
  const now = new Date();

  beforeEach(() => {
    rrepo = new ReportRepo()  as MockedReportRepo;
    prepo = new ProductRepo() as MockedProductRepo;
    crepo = new ClientRepo()  as MockedClientRepo;
    service = new ReportService();
    // inject mocks
    // @ts-ignore
    service['reportRepo']  = rrepo;
    // @ts-ignore
    service['productRepo'] = prepo;
    // @ts-ignore
    service['clientRepo']  = crepo;
  });

  describe('getTopProducts()', () => {
    it('maps rows to ProductResponse', async () => {
      rrepo.topProductsByUnits.mockResolvedValue([
        { productId: 'p1', totalUnits: 5 }
      ]);
      prepo.findById.mockResolvedValue({
        id: 'p1', code:'C', name:'N', description:null,
        price: '7', unit:'u', isDeleted:false,
        createdAt: now, updatedAt: now
      } as any);

      const out = await service.getTopProducts(1);
      expect(rrepo.topProductsByUnits).toHaveBeenCalledWith(1, undefined, undefined);
      expect(out[0].product.id).toBe('p1');
      expect(out[0].totalUnits).toBe(5);
    });

    it('throws if product missing', async () => {
      rrepo.topProductsByUnits.mockResolvedValue([{ productId: 'pX', totalUnits: 1 }]);
      prepo.findById.mockResolvedValue(null);
      await expect(service.getTopProducts(1)).rejects.toThrow("Product 'pX' not found");
    });
  });

  describe('getTopClients()', () => {
    it('maps rows to ClientResponse', async () => {
      rrepo.topClientsByTransactionCount.mockResolvedValue([
        { clientId: 'c1', transactionCount: 3 }
      ]);
      crepo.findById.mockResolvedValue({
        id:'c1', code:'D', name:'N', nit:'123',
        email:null, phone:null,
        isDeleted:false, createdAt: now, updatedAt: now
      } as any);

      const out = await service.getTopClients(1);
      expect(rrepo.topClientsByTransactionCount).toHaveBeenCalledWith(1, undefined, undefined);
      expect(out[0].client.id).toBe('c1');
      expect(out[0].transactionCount).toBe(3);
    });

    it('throws if client missing', async () => {
      rrepo.topClientsByTransactionCount.mockResolvedValue([{ clientId: 'cX', transactionCount: 1 }]);
      crepo.findById.mockResolvedValue(null);
      await expect(service.getTopClients(1)).rejects.toThrow("Client 'cX' not found");
    });
  });
});
