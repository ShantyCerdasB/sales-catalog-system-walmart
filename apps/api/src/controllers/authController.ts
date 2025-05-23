// apps/api/src/controllers/authController.ts

import { Router, Request, Response, NextFunction } from 'express';
import { UserSignupSchema, UserLoginSchema } from '@sales-catalog/types';
import { validateBody } from '../middleware/validateRequest';
import { hashPassword, verifyPassword } from '../utils/password';
import { signLocalToken } from '../utils/jwt';
import { prisma } from '../prisma';

const router: Router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     UserSignup:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *         password:
 *           type: string
 *           minLength: 8
 *         email:
 *           type: string
 *           format: email
 *     UserLogin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new local user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *     responses:
 *       '201':
 *         description: User created and JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '409':
 *         description: Username already taken
 *       '400':
 *         description: Validation error
 */
router.post(
  '/signup',
  validateBody(UserSignupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email } = req.body;

      // 1) Check for duplicate username
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // 2) Hash password
      const passwordHash = await hashPassword(password);

      // 3) Create user with email
      const user = await prisma.user.create({
        data: { username, passwordHash, email },
        select: { id: true, email: true }, // include email in response
      });

      // 4) Guard against missing email (should not occur)
      if (!user.email) {
        return next(new Error('User record has no email'));
      }

      // 5) Issue JWT
      const token = signLocalToken({
        sub: user.id,
        email: user.email,
        roles: [], // assign default roles if needed
      });

      return res.status(201).json({ token });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a local user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       '200':
 *         description: JWT issued on successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '401':
 *         description: Invalid credentials
 *       '400':
 *         description: Validation error
 */
router.post(
  '/login',
  validateBody(UserLoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      // 1) Fetch user including email & passwordHash
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true, email: true, passwordHash: true },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 2) Verify password
      const valid = await verifyPassword(user.passwordHash, password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 3) Guard against missing email
      if (!user.email) {
        return next(new Error('User record has no email'));
      }

      // 4) Issue JWT
      const token = signLocalToken({
        sub: user.id,
        email: user.email,
        roles: [], // include roles if available
      });

      return res.status(200).json({ token });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
