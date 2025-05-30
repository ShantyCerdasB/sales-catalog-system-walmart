import { PrismaClient, Client } from '@prisma/client';
import {
  ClientCreateSchema,
  ClientUpdateSchema,
  ClientCreate,
  ClientUpdate,
} from '../types';
import { ClientRepo } from '../repositories/clientRepo';

export default class ClientService {
  private readonly repo: ClientRepo;

  /**
   * @param prisma Shared PrismaClient instance
   */
  constructor(prisma: PrismaClient) {
    this.repo = new ClientRepo(prisma);
  }

  /**
   * Validates input, ensures no duplicate code/NIT, then creates.
   *
   * @param raw            Incoming payload (unvalidated).
   * @param createdById    UUID of the user performing creation.
   * @throws               Error('duplicate') if code or NIT already exists.
   */
  async create(raw: unknown, createdById: string): Promise<Client> {
    const data: ClientCreate = ClientCreateSchema.parse(raw);

    // Check duplicates:
    const [byCode, byNit] = await Promise.all([
      this.repo.findByCode(data.code),
      this.repo.findByNit(data.nit),
    ]);
    if (byCode || byNit) {
      throw new Error('duplicate');
    }

    // Create with createdBy foreign-key:
    return this.repo.create({
      ...data,
      createdBy: { connect: { id: createdById } },
    });
  }

  /**
   * Returns all non-deleted clients, optionally filtering by NIT.
   */
  async list(nit?: string): Promise<Client[]> {
    return this.repo.list(nit);
  }

  /**
   * Fetches a single client by ID if not deleted.
   *
   * @param id  Client UUID.
   * @returns   Client or null.
   */
  async get(id: string): Promise<Client | null> {
    return this.repo.findById(id);
  }

  /**
   * Validates update payload and applies it.
   *
   * @param id   Client UUID.
   * @param raw  Partial update payload.
   * @throws     Error('not-found') if no such client or already deleted.
   */
async update(id: string, raw: unknown): Promise<Client> {
  // First, check if the client exists:
  const existing = await this.repo.findById(id);
  if (!existing) {
    throw new Error('not-found');
  }

  // Validate the update payload:
  const data: ClientUpdate = ClientUpdateSchema.parse(raw);

 
  // Check for duplicates in the update:
  return this.repo.update(id, data);
}

  /**
   * Soft-deletes a client.
   *
   * @param id  Client UUID.
   * @throws   Error('not-found') if no such client or already deleted.
   */
  async remove(id: string): Promise<Client> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error('not-found');
    }
    return this.repo.softDelete(id);
  }
}
