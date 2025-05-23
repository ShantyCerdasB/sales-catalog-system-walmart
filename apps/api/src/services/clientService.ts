// apps/api/src/services/clientService.ts

import type {
  ClientCreate,
  ClientUpdate,
  ClientResponse,
} from "@sales-catalog/types";
import {
  ClientCreateSchema,
  ClientUpdateSchema,
  ClientResponseSchema,
} from "@sales-catalog/types";
import { Prisma, Client as ClientModel } from "@prisma/client";
import {
  createClient as repoCreate,
  listClients as repoList,
  getClientById as repoGet,
  updateClient as repoUpdate,
  deleteClient as repoDelete,
} from "../repositories/clientRepo";

type Decimal = Prisma.Decimal; // if you ever have Decimal fields

/**
 * Map a Prisma Client model into our API response shape.
 */
function mapClient(c: ClientModel): ClientResponse {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    nit: c.nit,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export const clientService = {
  /**
   * Create a new client.
   *
   * @param input – raw input to validate against ClientCreateSchema
   * @param userId – ID of the user creating this client
   * @returns the created client in API response format
   */
  async create(input: unknown, userId: string): Promise<ClientResponse> {
    // Validate & cast input
    const data = ClientCreateSchema.parse(input) as ClientCreate;

    const created = await repoCreate({
      ...data,
      createdById: userId,
    });

    // Map & validate response shape
    const dto = mapClient(created);
    return ClientResponseSchema.parse(dto);
  },

  /**
   * List all non-deleted clients.
   *
   * @returns an array of clients in API response format
   */
  async list(): Promise<ClientResponse[]> {
    const list = await repoList();
    return list.map((c) => ClientResponseSchema.parse(mapClient(c)));
  },

  /**
   * Get one client by ID.
   *
   * @param id – UUID of the client to retrieve
   * @throws Error if not found
   * @returns the found client in API response format
   */
  async get(id: string): Promise<ClientResponse> {
    const found = await repoGet(id);
    if (!found) throw new Error("Client not found");
    const dto = mapClient(found);
    return ClientResponseSchema.parse(dto);
  },

  /**
   * Update mutable fields of a client.
   *
   * @param id – UUID of the client to update
   * @param input – raw input to validate against ClientUpdateSchema
   * @throws Error if not found
   * @returns the updated client in API response format
   */
  async update(id: string, input: unknown): Promise<ClientResponse> {
    // Ensure existence
    await this.get(id);

    const data = ClientUpdateSchema.parse(input) as ClientUpdate;
    const updated = await repoUpdate(id, data);

    const dto = mapClient(updated);
    return ClientResponseSchema.parse(dto);
  },

  /**
   * Soft-delete a client.
   *
   * @param id – UUID of the client to remove
   * @throws Error if not found
   */
  async remove(id: string): Promise<void> {
    // Ensure existence
    await this.get(id);
    await repoDelete(id);
  },
};
