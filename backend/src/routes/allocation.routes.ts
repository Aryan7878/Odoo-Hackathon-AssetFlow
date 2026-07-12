import { Router } from 'express';
import { allocationController } from '../controllers/allocation.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /allocations:
 *   get:
 *     tags: [Allocations]
 *     summary: Get all allocations with pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, RETURNED] }
 *       - in: query
 *         name: assetId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: userId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated list of allocations
 */
router.get('/', authenticate, asyncWrapper(allocationController.findAll.bind(allocationController)));

/**
 * @swagger
 * /allocations:
 *   post:
 *     tags: [Allocations]
 *     summary: Allocate an asset to a user
 *     description: Asset must be AVAILABLE. Returns 409 if already allocated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetId, allocatedToId]
 *             properties:
 *               assetId: { type: string, format: uuid }
 *               allocatedToId: { type: string, format: uuid }
 *               expectedReturn: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Asset allocated, status changed to ALLOCATED
 *       409:
 *         description: Asset not available or already allocated
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(allocationController.allocate.bind(allocationController))
);

/**
 * @swagger
 * /allocations/{id}:
 *   get:
 *     tags: [Allocations]
 *     summary: Get allocation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Allocation details
 */
router.get('/:id', authenticate, asyncWrapper(allocationController.findById.bind(allocationController)));

/**
 * @swagger
 * /allocations/{id}/return:
 *   post:
 *     tags: [Allocations]
 *     summary: Return an allocated asset
 *     description: Closes the active allocation and changes asset status back to AVAILABLE
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnNotes: { type: string }
 *     responses:
 *       200:
 *         description: Asset returned, status changed to AVAILABLE
 */
router.post(
  '/:id/return',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(allocationController.returnAsset.bind(allocationController))
);

export default router;
