import { Router } from "express";
import { prismaInstance } from "../prisma";
import ClientService from "../services/clientService";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest";
import { jwtAuth } from "../middleware/jwtAuth";
import {
  ClientCreateSchema,
  ClientUpdateSchema,
} from '../types/index';
import { z } from "zod";

const service = new ClientService(prismaInstance);
const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Clients
 *     description: Operations on clients
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: List clients, optionally filtered by NIT
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: query
 *         name: nit
 *         schema:
 *           type: string
 *           example: "12345"
 *         description: Filter by tax ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of client records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  validateQuery(ClientUpdateSchema.pick({ nit: true })),
  async (req, res, next) => {
    try {
      const nit = req.query.nit as string | undefined;
      const clients = await service.list(nit);
      res.json(clients);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get a single client by ID
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res, next) => {
    try {
      const client = await service.get(req.params.id);
      if (!client) return res.sendStatus(404);
      res.json(client);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientCreate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Newly created client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate code or NIT
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  validateBody(ClientCreateSchema),
  async (req, res, next) => {
    try {
      console.log("Creating client with body:", req.body);
      if (!req.user) return res.sendStatus(401);
      console.log("User ID from JWT:", req.user.id);
      const created = await service.create(req.body, req.user.id);
      console.log("Created client:", created);
      res.status(201).json(created);
      
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: Update an existing client
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientUpdate'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated client record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(ClientUpdateSchema),
  async (req, res, next) => {
    try {
      const updated = await service.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Soft delete a client
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Client deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req, res, next) => {
    try {
      await service.remove(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
