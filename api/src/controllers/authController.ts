import { Router, Request, Response, NextFunction } from 'express'
import { prismaInstance } from '../prisma'
import UserService from '../services/userService'
import { validateBody } from '../middleware/validateRequest'
import { UserSignupSchema, UserLoginSchema } from '../types'
import { AuthPayload } from '../types/auth'

const router = Router()
const service = new UserService(prismaInstance)

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints for user signup, login, refresh, and logout
 * components:
 *   schemas:
 *     AuthPayload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: List of assigned roles
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *   responses:
 *     Unauthorized:
 *       description: Missing or invalid credentials
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Unauthorized
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *     responses:
 *       201:
 *         description: Created — returns user ID and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthPayload'
 *       400:
 *         description: Bad Request — payload validation failed
 *       409:
 *         description: Conflict — username or email already exists
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/signup',
  validateBody(UserSignupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth: AuthPayload = await service.signup(req.body)

      // Store refresh token in HttpOnly cookie
      res.cookie('refreshToken', auth.refreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path:     '/auth',
        maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
      })

      return res.status(201).json(auth)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and receive tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: OK — returns user ID and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthPayload'
 *       400:
 *         description: Bad Request — payload validation failed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/login',
  validateBody(UserLoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Auth payload:')
      const auth: AuthPayload = await service.login(req.body)
      res.cookie('refreshToken', auth.refreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path:     '/auth',
        maxAge:   7 * 24 * 60 * 60 * 1000,
      })
      console.log('Set refresh token cookie:', auth.refreshToken)
      return res.json(auth)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token via HttpOnly cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OK — returns new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.refreshToken as string | undefined
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const { accessToken } = await service.refreshAccessToken(token)
      return res.json({ accessToken })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and clear refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: No Content — cookie cleared
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken', { path: '/auth' })
  return res.sendStatus(204)
})

export default router
