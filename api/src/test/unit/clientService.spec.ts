import ClientService from '../../services/clientService';
import { ClientRepo } from '../../repositories/clientRepo';
import { ClientCreate } from '../../types/index';

type MockedClientRepo = jest.Mocked<ClientRepo>;

jest.mock('../../repositories/clientRepo');

describe('ClientService', () => {
  let service: ClientService;
  let repo: MockedClientRepo;

  beforeEach(() => {
    (ClientRepo as jest.Mock).mockClear();
    repo = new ClientRepo() as MockedClientRepo;
    service = new ClientService({} as any);
    // override the real repo with our mock
    // @ts-ignore
    service['repo'] = repo;
  });

  describe('create()', () => {
    const newClient: ClientCreate = {
      code: 'ABC',
      name: 'Test Co',
      nit: '98765432',
      email: undefined,
      phone: undefined,
    };

    it('successfully creates when no duplicates exist', async () => {
      repo.findByCode.mockResolvedValue(null);
      repo.findByNit.mockResolvedValue(null);

      const saved = { id: '1', ...newClient, isDeleted: false };
      repo.create.mockResolvedValue(saved as any);

      const result = await service.create(newClient, 'user-123');
      expect(repo.findByCode).toHaveBeenCalledWith('ABC');
      expect(repo.findByNit).toHaveBeenCalledWith('98765432');
      expect(repo.create).toHaveBeenCalledWith({
        ...newClient,
        createdBy: { connect: { id: 'user-123' } },
      });
      expect(result).toEqual(saved);
    });

    it('throws “duplicate” if code exists', async () => {
      repo.findByCode.mockResolvedValue({} as any);
      await expect(service.create(newClient, 'user-123')).rejects.toThrow('duplicate');
    });

    it('throws “duplicate” if NIT exists', async () => {
      repo.findByCode.mockResolvedValue(null);
      repo.findByNit.mockResolvedValue({} as any);
      await expect(service.create(newClient, 'user-123')).rejects.toThrow('duplicate');
    });
  });

  describe('list()', () => {
    it('returns whatever the repo returns', async () => {
      const sample = [{ id: 'a' }] as any;
      repo.list.mockResolvedValue(sample);
      const result = await service.list('1234');
      expect(repo.list).toHaveBeenCalledWith('1234');
      expect(result).toBe(sample);
    });
  });

  describe('get()', () => {
    it('fetches by ID', async () => {
      const sample = { id: 'a' } as any;
      repo.findById.mockResolvedValue(sample);
      const result = await service.get('a');
      expect(repo.findById).toHaveBeenCalledWith('a');
      expect(result).toBe(sample);
    });
  });

  describe('update()', () => {
    it('updates an existing client', async () => {
      repo.findById.mockResolvedValue({ id: 'a' } as any);
      repo.update.mockResolvedValue({ id: 'a', name: 'NewName' } as any);

      const result = await service.update('a', { name: 'NewName' });
      expect(repo.findById).toHaveBeenCalledWith('a');
      expect(repo.update).toHaveBeenCalledWith('a', { name: 'NewName' });
      expect(result.name).toBe('NewName');
    });

    it('throws “not-found” when client is missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('a', { name: 'X' })).rejects.toThrow('not-found');
    });
  });

  describe('remove()', () => {
    it('soft-deletes when found', async () => {
      repo.findById.mockResolvedValue({ id: 'a' } as any);
      repo.softDelete.mockResolvedValue({ id: 'a', isDeleted: true } as any);

      const result = await service.remove('a');
      expect(repo.findById).toHaveBeenCalledWith('a');
      expect(repo.softDelete).toHaveBeenCalledWith('a');
      expect(result.isDeleted).toBe(true);
    });

    it('throws “not-found” when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('a')).rejects.toThrow('not-found');
    });
  });
});
