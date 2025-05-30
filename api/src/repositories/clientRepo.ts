import { PrismaClient, Prisma, Client } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Provides persistence operations for Client entities.
 */
export class ClientRepo {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Creates a new client record, including the createdBy relation.
   *
   * @param data  Data for the new client (code, name, nit, etc.)
   * @param tx    Optional Prisma transaction client.
   * @returns     The newly created Client record.
   */
  async create(
    data: Prisma.ClientCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<Client> {
    const db = tx ?? prisma;
    return db.client.create({
      data: {
        ...data,
        isDeleted: false,
      },
    });
  }

  /**
   * Finds a client by its unique code.
   *
   * @param code  The unique client code.
   * @returns     Client or null.
   */
  async findByCode(code: string): Promise<Client | null> {
    return this.db.client.findUnique({ where: { code } });
  }

  /**
   * Finds a client by its unique NIT.
   *
   * @param nit   The tax ID.
   * @returns     Client or null.
   */
  async findByNit(nit: string): Promise<Client | null> {
    return this.db.client.findUnique({ where: { nit } });
  }

  /**
   * Lists all non-deleted clients, optionally filtered by NIT.
   *
   * @param nit   Optional NIT to filter.
   * @returns     Array of Clients.
   */
  async list(nit?: string): Promise<Client[]> {
    return this.db.client.findMany({
      where: {
        isDeleted: false,
        ...(nit ? { nit } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches a single non-deleted client by UUID.
   *
   * @param id    Client UUID.
   * @returns     Client or null.
   */
  async findById(id: string): Promise<Client | null> {
    return this.db.client.findFirst({
      where: { id, isDeleted: false },
    });
  }

  /**
   * Updates fields on an existing client.
   *
   * @param id    Client UUID.
   * @param data  Fields to update.
   * @param tx    Optional transaction client.
   * @returns     Updated Client.
   */
  async update(
    id: string,
    data: Prisma.ClientUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<Client> {
    const client = tx ?? this.db;
    return client.client.update({ where: { id }, data });
  }

  /**
   * Soft-deletes a client (marks isDeleted = true).
   *
   * @param id    Client UUID.
   * @param tx    Optional transaction client.
   * @returns     Updated Client.
   */
  async softDelete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Client> {
    const client = tx ?? this.db;
    return client.client.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
