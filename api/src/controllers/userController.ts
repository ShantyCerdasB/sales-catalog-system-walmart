import { Router } from 'express'
import { prismaInstance as prisma } from '../prisma'
import type { User } from '@prisma/client'

interface UserWithRoles extends User {
  roles: { roleId: string }[]
}

const router = Router()

/**
 * GET /users
 * Returns all users, each with their list of role IDs.
 */
router.get('/', async (req, res, next) => {
  try {
    // Include the `roles` relation exactly as named in schema.prisma
    const users = await prisma.user.findMany({
      include: {
        roles: {
          select: { roleId: true }
        }
      }
    }) as UserWithRoles[]

    // Map into the shape we want to expose
    const payload = users.map(u => ({
      id:           u.id,
      username:     u.username,
      email:        u.email,
      roles:        u.roles.map(r => r.roleId),
      passwordHash: u.passwordHash,
      createdAt:    u.createdAt.toISOString(),
      updatedAt:    u.updatedAt.toISOString(),
    }))

    res.json(payload)
  } catch (err) {
    next(err)
  }
})

export default router
