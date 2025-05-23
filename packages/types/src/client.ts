// packages/types/src/client.ts
import { z } from "zod";

/**
 * Zod schema for a Client record.
 *
 * Fields:
 * - `id`         : UUID string, primary key.
 * - `code`       : Unique alphanumeric client code (non-empty).
 * - `name`       : Full name of the client (non-empty).
 * - `nit`        : Unique tax identifier (NIT) (non-empty).
 * - `email`      : Optional contact email (must be valid).
 * - `phone`      : Optional phone number.
 * - `isDeleted`  : Soft-delete flag.
 * - `createdAt`  : ISO-8601 creation timestamp.
 * - `updatedAt`  : ISO-8601 last-update timestamp.
 */
export const ClientSchema = z.object({
  id:         z.string().uuid(),
  code:       z.string().nonempty(),
  name:       z.string().nonempty(),
  nit:        z.string().nonempty(),
  email:      z.string().email().nullable().optional(),
  phone:      z.string().nullable().optional(),
  isDeleted:  z.boolean(),
  createdAt:  z.string().datetime(),
  updatedAt:  z.string().datetime(),
});

/** TS type for full Client record. */
export type Client = z.infer<typeof ClientSchema>;

/**
 * Response schema: what is sent back to clients, excludes `isDeleted`.
 */
export const ClientResponseSchema = ClientSchema.omit({ isDeleted: true });

/** TS type for API response shape. */
export type ClientResponse = z.infer<typeof ClientResponseSchema>;

/**
 * Schema for creating a Client.
 * Excludes system and soft-delete fields (id, isDeleted, createdAt, updatedAt).
 */
export const ClientCreateSchema = ClientSchema.pick({
  code: true,
  name: true,
  nit: true,
  email: true,
  phone: true,
});
export type ClientCreate = z.infer<typeof ClientCreateSchema>;

/**
 * Schema for updating a Client.
 * All create-fields optional.
 */
export const ClientUpdateSchema = ClientCreateSchema.partial();
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;
