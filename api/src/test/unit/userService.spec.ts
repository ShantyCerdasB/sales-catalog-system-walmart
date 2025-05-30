import UserService from '../../services/userService';
import { UserRepo } from '../../repositories/userRepo';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

jest.mock('../../repositories/userRepo');
jest.mock('argon2');

type MockedUserRepo = jest.Mocked<UserRepo>;
const fakePrisma = { $transaction: (fn:any) => fn({ userRole: { create: jest.fn() } }) } as any as PrismaClient;

describe('UserService', () => {
  let service: UserService;
  let repo:    MockedUserRepo;

  beforeEach(() => {
    repo = new UserRepo() as MockedUserRepo;
    service = new UserService(fakePrisma);
    // @ts-ignore
    service['repo'] = repo;
    (argon2.hash as jest.Mock).mockResolvedValue('hashed');
  });

  describe('signup()', () => {
    it('throws on duplicate username or email', async () => {
      repo.findByUsername.mockResolvedValue({} as any);
      await expect(service.signup({ username:'u', password:'P1', email:'e' }))
        .rejects.toThrow('duplicate');

      repo.findByUsername.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue({} as any);
      await expect(service.signup({ username:'u', password:'P1', email:'e' }))
        .rejects.toThrow('duplicate');
    });

    it('creates user and returns tokens', async () => {
      repo.findByUsername.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue(null);
      // mock repo.create to return a user
      service['repo'].create = jest.fn().mockResolvedValue({ id:'u1', email:'e' } as any);

      const out = await service.signup({ username:'shanty213', password:'ADcc2023.', email:'sganty@gmail.com' });
      expect(out.id).toBe('u1');
      expect(typeof out.accessToken).toBe('string');
      expect(typeof out.refreshToken).toBe('string');
    });
  });

  describe('login()', () => {
    it('throws if user not found', async () => {
      repo.findByUsername.mockResolvedValue(null);
      await expect(service.login({ username:'x', password:'p' }))
        .rejects.toThrow('invalid');
    });

    it('throws if password mismatch', async () => {
      repo.findByUsername.mockResolvedValue({ passwordHash:'h' } as any);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ username:'u', password:'p' }))
        .rejects.toThrow('invalid');
    });

    it('returns tokens on success', async () => {
      repo.findByUsername.mockResolvedValue({ id:'u1', email:'e', passwordHash:'h' } as any);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const out = await service.login({ username:'u', password:'p' });
      expect(out.id).toBe('u1');
      expect(out.accessToken).toBeDefined();
      expect(out.refreshToken).toBeDefined();
    });
  });

  describe('changePassword()', () => {
    it('hashes and calls repo.updatePassword', async () => {
      repo.updatePassword = jest.fn().mockResolvedValue({} as any);
      (argon2.hash as jest.Mock).mockResolvedValue('newhash');

      await service.changePassword('u1','newpass');
      expect(repo.updatePassword).toHaveBeenCalledWith('u1','newhash');
    });
  });
});
