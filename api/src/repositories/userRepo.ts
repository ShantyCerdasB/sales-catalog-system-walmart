import { Prisma, User, Role, UserRole } from '@prisma/client'
import { prismaInstance as prisma } from '../prisma'

/**
 * Repository for User and Role-related database operations.
 */
export class UserRepo {
  /**
   * Look up a user by their unique username.
   * @param username – the username to search for
   * @returns the matching User record, or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } })
  }

  /**
   * Look up a user by their unique email address.
   * @param email – the email to search for
   * @returns the matching User record, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  /**
   * Create a new user record.
   * @param data – Prisma-compatible payload for creating a User
   * @param tx   – optional transaction client
   * @returns the created User
   */
  async create(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    const db = tx ?? prisma
    return db.user.create({ data })
  }

  /**
   * Update an existing user's password hash.
   * @param id           – user’s UUID
   * @param passwordHash – new hashed password string
   * @param tx           – optional transaction client
   * @returns the updated User
   */
  async updatePassword(
    id: string,
    passwordHash: string,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    const db = tx ?? prisma
    return db.user.update({
      where: { id },
      data: { passwordHash },
    })
  }

  /**
   * Retrieve the list of role names assigned to a given user.
   * @param userId – the UUID of the user
   * @returns array of role names (e.g. ['USER', 'ADMIN'])
   */
  async findRolesByUserId(userId: string): Promise<string[]> {
    const assignments = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    })
    return assignments.map((ur: UserRole & { role: Role }) => ur.role.name)
  }
}
