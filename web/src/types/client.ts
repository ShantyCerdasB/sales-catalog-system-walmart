import { z } from "zod";

/**
 * Full Client record schema (1-to-1 with DB columns).
 */
export const ClientSchema = z.object({
  id: z.string().uuid(),
  code: z
    .string()
    .regex(/^[A-Z0-9-]{3,50}$/, {
      message: "Code must be 3-50 characters: uppercase letters, digits or '-'",
    }),
  name: z.string().min(3).max(100),
  nit: z
    .string()
    .regex(/^[0-9\-]{6,20}$/, { message: "Invalid NIT format" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .max(100)
    .nullable()
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,20}$/, { message: "Invalid phone number" })
    .nullable()
    .optional(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Client = z.infer<typeof ClientSchema>;

/**
 * Outbound shape (excludes soft-delete flag).
 */
export const ClientResponseSchema = ClientSchema.omit({ isDeleted: true });
export type ClientResponse = z.infer<typeof ClientResponseSchema>;

/**
 * Payload for client creation.
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
 * Payload for partial client updates.
 */
export const ClientUpdateSchema = ClientCreateSchema.partial();
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;