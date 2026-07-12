import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /audit:
 *   get:
 *     tags: [Audit]
 *     summary: Get all audit cycles
 *     responses:
 *       200:
 *         description: Paginated audit cycles
 */
router.get('/', authenticate, asyncWrapper(auditController.findAll.bind(auditController)));

/**
 * @swagger
 * /audit:
 *   post:
 *     tags: [Audit]
 *     summary: Create a new audit cycle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               departmentId: { type: string, format: uuid }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               assetIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       201:
 *         description: Audit cycle created
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(auditController.createCycle.bind(auditController))
);

/**
 * @swagger
 * /audit/{id}:
 *   get:
 *     tags: [Audit]
 *     summary: Get audit cycle by ID with all items
 */
router.get('/:id', authenticate, asyncWrapper(auditController.findById.bind(auditController)));

/**
 * @swagger
 * /audit/{id}/assets:
 *   post:
 *     tags: [Audit]
 *     summary: Add assets to audit cycle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetIds]
 *             properties:
 *               assetIds: { type: array, items: { type: string, format: uuid } }
 */
router.post(
  '/:id/assets',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(auditController.addAssets.bind(auditController))
);

/**
 * @swagger
 * /audit/{id}/items/{itemId}:
 *   put:
 *     tags: [Audit]
 *     summary: Update audit item status (Verified/Missing/Damaged)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, VERIFIED, MISSING, DAMAGED] }
 *               notes: { type: string }
 */
router.put(
  '/:id/items/:itemId',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(auditController.updateItem.bind(auditController))
);

/**
 * @swagger
 * /audit/{id}/complete:
 *   post:
 *     tags: [Audit]
 *     summary: Mark audit cycle as complete
 */
router.post(
  '/:id/complete',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(auditController.completeCycle.bind(auditController))
);

/**
 * @swagger
 * /audit/{id}/report:
 *   get:
 *     tags: [Audit]
 *     summary: Get discrepancy report for an audit cycle
 */
router.get(
  '/:id/report',
  authenticate,
  asyncWrapper(auditController.getDiscrepancyReport.bind(auditController))
);

export default router;
