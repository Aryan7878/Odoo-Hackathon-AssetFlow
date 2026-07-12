import { Router } from 'express';
import { assetController } from '../controllers/asset.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /assets:
 *   get:
 *     tags: [Assets]
 *     summary: Get all assets with filtering, search, and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [AVAILABLE, ALLOCATED, UNDER_MAINTENANCE, RETIRED, LOST] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: condition
 *         schema: { type: string, enum: [EXCELLENT, GOOD, FAIR, DAMAGED] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Paginated list of assets
 */
router.get('/', authenticate, asyncWrapper(assetController.findAll.bind(assetController)));

/**
 * @swagger
 * /assets:
 *   post:
 *     tags: [Assets]
 *     summary: Create a new asset (auto-generates asset tag)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, categoryId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string, format: uuid }
 *               departmentId: { type: string, format: uuid }
 *               serialNumber: { type: string }
 *               purchaseDate: { type: string, format: date-time }
 *               purchaseCost: { type: number }
 *               vendor: { type: string }
 *               warrantyExpiry: { type: string, format: date-time }
 *               location: { type: string }
 *               condition: { type: string, enum: [EXCELLENT, GOOD, FAIR, DAMAGED] }
 *     responses:
 *       201:
 *         description: Asset created with auto-generated tag (e.g., AF-00001)
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(assetController.create.bind(assetController))
);

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     tags: [Assets]
 *     summary: Get asset by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Asset details
 *       404:
 *         description: Asset not found
 */
router.get('/:id', authenticate, asyncWrapper(assetController.findById.bind(assetController)));

/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     tags: [Assets]
 *     summary: Update asset
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Asset updated
 */
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(assetController.update.bind(assetController))
);

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     tags: [Assets]
 *     summary: Delete asset (cannot delete allocated assets)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Asset deleted
 *       409:
 *         description: Cannot delete allocated asset
 */
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  asyncWrapper(assetController.delete.bind(assetController))
);

/**
 * @swagger
 * /assets/{id}/history:
 *   get:
 *     tags: [Assets]
 *     summary: Get complete asset history (allocations, maintenance, transfers)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Asset history
 */
router.get('/:id/history', authenticate, asyncWrapper(assetController.getHistory.bind(assetController)));

export default router;
