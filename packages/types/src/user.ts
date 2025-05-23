// packages/types/src/user.ts
import { z } from 'zod';

/**
 * Zod schema for a user signup (local authentication) request payload.
 */
export const UserSignupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }).nonempty({ message: "Username is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  email:    z.string().email({ message: "Invalid email address" }),
});

export type UserSignup = z.infer<typeof UserSignupSchema>;

/**
 * Zod schema for a user login (local authentication) request payload.
 */
export const UserLoginSchema = z.object({
  username: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;
