import { z } from "zod";

/**
 * Zod schema for a user-signup payload.
 *  • Username 3-30 chars, letters/numbers/underscore.
 *  • Password 8-72 chars, at least one letter & one number
 *    (72 is bcrypt/argon2 safe limit).
 *  • Email max 100 chars to match DB column.
 */
export const UserSignupSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,30}$/, {
      message:
        "Username must be 3-30 characters long and may contain letters, numbers or underscore",
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(72)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
      message: "Password must contain at least one letter and one number",
    }),
  email: z.string().email({ message: "Invalid email address" }).max(100),
});

export type UserSignup = z.infer<typeof UserSignupSchema>;

/**
 * Zod schema for a user-login payload.
 */
export const UserLoginSchema = z.object({
  username: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;
