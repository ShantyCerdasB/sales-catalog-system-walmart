// apps/api/src/repositories/clientRepo.ts

import { PrismaClient, Client } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new client.
 *
 * @param data.code        – unique alphanumeric client code
 * @param data.name        – full client name
 * @param data.nit         – unique tax identifier (NIT)
 * @param data.email?      – optional contact email
 * @param data.phone?      – optional phone number
 * @param data.createdById – ID of the user creating this client
 * @returns the newly created Client record
 */
export function createClient(data: {
  code: string;
  name: string;
  nit: string;
  email?: string | null;
  phone?: string | null;
  createdById: string;
}): Promise<Client> {
  return prisma.client.create({
    data: {
      code: data.code,
      name: data.name,
      nit: data.nit,
      email: data.email ?? null,
      phone: data.phone ?? null,
      createdBy: { connect: { id: data.createdById } },
    },
  });
}

/**
 * List all non-deleted clients, ordered by creation date descending.
 *
 * @returns an array of Client records
 */
export function listClients(): Promise<Client[]> {
  return prisma.client.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find one non-deleted client by its ID.
 *
 * @param id – UUID of the client to retrieve
 * @returns the Client record, or null if not found
 */
export function getClientById(id: string): Promise<Client | null> {
  return prisma.client.findFirst({
    where: { id, isDeleted: false },
  });
}

/**
 * Update mutable fields of an existing client.
 *
 * @param id   – UUID of the client to update
 * @param data – partial fields to update
 * @returns the updated Client record
 */
export function updateClient(
  id: string,
  data: {
    code?: string;
    name?: string;
    nit?: string;
    email?: string | null;
    phone?: string | null;
  }
): Promise<Client> {
  return prisma.client.update({
    where: { id },
    data: {
      ...data,
    },
  });
}

/**
 * Soft-delete a client by setting its `isDeleted` flag.
 *
 * @param id – UUID of the client to soft-delete
 * @returns the updated Client record with isDeleted = true
 */
export function deleteClient(id: string): Promise<Client> {
  return prisma.client.update({
    where: { id },
    data: { isDeleted: true },
  });
}
