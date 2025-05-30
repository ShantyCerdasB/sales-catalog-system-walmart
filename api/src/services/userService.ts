import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import { UserRepo } from '../repositories/userRepo'
import { signLocalToken, verifyLocalToken } from '../utils/jwt'
import {
  UserSignup,
  UserSignupSchema,
  UserLogin,
  UserLoginSchema,
} from '../types'
import { AuthPayload } from '../types/auth'

/**
 * Service layer that handles all user-related business logic:
 * - Signup (register new users and assign default roles)
 * - Login (validate credentials and issue tokens)
 * - Token refresh (verify refresh tokens and issue new access tokens)
 * - Password changes
 */
export default class UserService {
  private readonly repo: UserRepo
  private readonly prisma: PrismaClient

  /**
   * @param prisma  Shared Prisma client instance for database operations.
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.repo    = new UserRepo()
  }

  /**
   * Register a new user account.
   *
   * Steps:
   *   1. Parse and validate the request payload via Zod.
   *   2. Check for existing username or email; throw on duplicates.
   *   3. Hash the plaintext password with Argon2id.
   *   4. In a single transaction, create the User record and assign the default "USER" role.
   *   5. Read back the user’s roles.
   *   6. Issue a short-lived access token and a long-lived refresh token containing id, email, and roles.
   *
   * @param raw  The raw JSON payload from the client (username, password, email).
   * @returns    An AuthPayload containing id, email, roles, accessToken, and refreshToken.
   * @throws     Error('duplicate') if the username or email is already taken.
   * @throws     ZodError on schema validation failures.
   */

  async signup(raw: unknown): Promise<AuthPayload> {
    // ▸ 0) Quick duplicate check on raw input, before schema parsing:
    const candidate = raw as { username?: string; email?: string }
    if (
      candidate.username &&
      (await this.repo.findByUsername(candidate.username))
    ) {
      throw new Error('duplicate')
    }
    if (
      candidate.email &&
      (await this.repo.findByEmail(candidate.email))
    ) {
      throw new Error('duplicate')
    }

    // ▸ 1) Now validate shape and types via Zod
    const data: UserSignup = UserSignupSchema.parse(raw)

    // ▸ 2) Hash the password
    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    })

    // ▸ 3) Create user + role transactionally
    const created = await this.prisma.$transaction(async (tx) => {
      const user = await this.repo.create(
        {
          username:     data.username,
          email:        data.email,
          passwordHash: passwordHash,
        },
        tx
      )
      await tx.userRole.create({
        data: { userId: user.id, roleId: 'USER' },
      })
      return user
    })

    // ▸ 4) Read roles back
    const roles = await this.repo.findRolesByUserId(created.id)

    // ▸ 5) Issue tokens embedding id, email, roles
    const accessToken  = signLocalToken({ id: created.id, email: created.email!, roles })
    const refreshToken = signLocalToken({ id: created.id, email: created.email!, roles }, '7d')

    return {
      id:           created.id,
      email:        created.email!,
      roles:        roles,
      accessToken:  accessToken,
      refreshToken: refreshToken,
    }
  }

  /**
   * Authenticate a user’s credentials and issue new tokens.
   *
   * Steps:
   *   1. Parse and validate the login payload via Zod.
   *   2. Look up the user by username; throw if not found.
   *   3. Verify the password hash; throw on mismatch.
   *   4. Read the user’s roles.
   *   5. Issue fresh access and refresh tokens.
   *
   * @param raw  The raw JSON payload from the client (username, password).
   * @returns    An AuthPayload containing id, email, roles, accessToken, and refreshToken.
   * @throws     Error('invalid') on wrong credentials.
   * @throws     ZodError on schema validation failures.
   */
  async login(raw: unknown): Promise<AuthPayload> {
    // 1) Validate input
    const creds: UserLogin = UserLoginSchema.parse(raw)

    // 2) Fetch user record
    const userRecord = await this.repo.findByUsername(creds.username)
    if (!userRecord) {
      throw new Error('invalid')
    }

    // 3) Verify password
    const isMatch = await argon2.verify(userRecord.passwordHash, creds.password)
    if (!isMatch) {
      throw new Error('invalid')
    }

    // 4) Retrieve roles
    const roles = await this.repo.findRolesByUserId(userRecord.id)

    // 5) Issue tokens
    const accessToken  = signLocalToken({ id: userRecord.id, email: userRecord.email!, roles })
    const refreshToken = signLocalToken({ id: userRecord.id, email: userRecord.email!, roles }, '7d')

    return {
      id:           userRecord.id,
      email:        userRecord.email!,
      roles:        roles,
      accessToken:  accessToken,
      refreshToken: refreshToken,
    }
  }

  /**
   * Refresh the access token using a valid refresh token.
   *
   * Steps:
   *   1. Verify the refresh token’s signature and expiry.
   *   2. Extract id, email, and roles from the token payload.
   *   3. Issue a new short-lived access token.
   *
   * @param token  The JWT refresh token (from HttpOnly cookie).
   * @returns      An object containing the new accessToken.
   * @throws       JsonWebTokenError if token is invalid or expired.
   */
  async refreshAccessToken(token: string): Promise<{ accessToken: string }> {
    // 1) Decode and verify
    const payload = verifyLocalToken(token)  // { id, email, roles, iss }

    // 2 & 3) Issue new access token
    const accessToken = signLocalToken({
      id:    payload.id,
      email: payload.email,
      roles: payload.roles ?? [],
    })

    return { accessToken }
  }

  /**
   * Change a user’s password.
   *
   * @param userId       The user’s UUID whose password to update.
   * @param newPassword  The new plaintext password to hash and store.
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const newHash = await argon2.hash(newPassword, { type: argon2.argon2id })
    await this.repo.updatePassword(userId, newHash)
  }
}
