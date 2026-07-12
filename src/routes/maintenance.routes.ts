import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /maintenance:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get all maintenance requests
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, IN_PROGRESS, COMPLETED, REJECTED] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *     responses:
 *       200:
 *         description: Paginated maintenance requests
 */
router.get('/', authenticate, asyncWrapper(maintenanceController.findAll.bind(maintenanceController)));

/**
 * @swagger
 * /maintenance:
 *   post:
 *     tags: [Maintenance]
 *     summary: Raise a maintenance request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetId, title, description]
 *             properties:
 *               assetId: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               scheduledDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Maintenance request created
 */
router.post('/', authenticate, asyncWrapper(maintenanceController.create.bind(maintenanceController)));

/**
 * @swagger
 * /maintenance/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get maintenance request by ID
 */
router.get('/:id', authenticate, asyncWrapper(maintenanceController.findById.bind(maintenanceController)));

/**
 * @swagger
 * /maintenance/{id}/approve:
 *   post:
 *     tags: [Maintenance]
 *     summary: Approve a maintenance request
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedToId: { type: string, format: uuid }
 *               scheduledDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Maintenance approved
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(maintenanceController.approve.bind(maintenanceController))
);

/**
 * @swagger
 * /maintenance/{id}/reject:
 *   post:
 *     tags: [Maintenance]
 *     summary: Reject a maintenance request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejectionNote]
 *             properties:
 *               rejectionNote: { type: string }
 *     responses:
 *       200:
 *         description: Maintenance rejected
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(maintenanceController.reject.bind(maintenanceController))
);

/**
 * @swagger
 * /maintenance/{id}/start:
 *   post:
 *     tags: [Maintenance]
 *     summary: Start maintenance (changes asset status to UNDER_MAINTENANCE)
 *     responses:
 *       200:
 *         description: Maintenance started
 */
router.post(
  '/:id/start',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(maintenanceController.startMaintenance.bind(maintenanceController))
);

/**
 * @swagger
 * /maintenance/{id}/complete:
 *   post:
 *     tags: [Maintenance]
 *     summary: Complete maintenance (changes asset status back to AVAILABLE)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution]
 *             properties:
 *               resolution: { type: string }
 *               cost: { type: number }
 *     responses:
 *       200:
 *         description: Maintenance completed, asset AVAILABLE
 */
router.post(
  '/:id/complete',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(maintenanceController.complete.bind(maintenanceController))
);

export default router;
