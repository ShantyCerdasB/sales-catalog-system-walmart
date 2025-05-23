// apps/api/src/controllers/clientController.ts

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ClientResponse } from "@sales-catalog/types";
import {
  ClientCreateSchema,
  ClientUpdateSchema,
} from "@sales-catalog/types";
import { clientService } from "../services/clientService";
import { validateBody, validateParams } from "../middleware/validateRequest";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   - name: Clients
 *     description: CRUD operations on clients
 */

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientCreate'
 *     responses:
 *       201:
 *         description: Created client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 */
router.post(
  "/",
  validateBody(ClientCreateSchema),
  async (req: Request<{}, {}, unknown>, res: Response<ClientResponse>, next: NextFunction) => {
    try {
      const client = await clientService.create(req.body, req.user.id);
      res.status(201).json(client);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: List all clients
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: Array of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientResponse'
 */
router.get(
  "/",
  async (_: Request, res: Response<ClientResponse[]>, next: NextFunction) => {
    try {
      const list = await clientService.list();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 *       404:
 *         description: Client not found
 */
router.get(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req: Request, res: Response<ClientResponse>, next: NextFunction) => {
    try {
      const client = await clientService.get(req.params.id);
      res.json(client);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update a client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Client ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientUpdate'
 *     responses:
 *       200:
 *         description: Updated client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientResponse'
 */
router.put(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(ClientUpdateSchema),
  async (req: Request, res: Response<ClientResponse>, next: NextFunction) => {
    try {
      const updated = await clientService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Soft-delete a client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Client ID
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete(
  "/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientService.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
