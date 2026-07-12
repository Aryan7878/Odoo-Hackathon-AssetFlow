import { Router } from 'express';
import { transferController } from '../controllers/transfer.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /transfers:
 *   get:
 *     tags: [Transfers]
 *     summary: Get all transfer requests
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *     responses:
 *       200:
 *         description: Paginated transfer requests
 */
router.get('/', authenticate, asyncWrapper(transferController.findAll.bind(transferController)));

/**
 * @swagger
 * /transfers:
 *   post:
 *     tags: [Transfers]
 *     summary: Request asset transfer to another user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetId, toUserId, reason]
 *             properties:
 *               assetId: { type: string, format: uuid }
 *               toUserId: { type: string, format: uuid }
 *               toDeptId: { type: string, format: uuid }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Transfer request created
 */
router.post('/', authenticate, asyncWrapper(transferController.create.bind(transferController)));

/**
 * @swagger
 * /transfers/{id}:
 *   get:
 *     tags: [Transfers]
 *     summary: Get transfer request by ID
 */
router.get('/:id', authenticate, asyncWrapper(transferController.findById.bind(transferController)));

/**
 * @swagger
 * /transfers/{id}/approve:
 *   post:
 *     tags: [Transfers]
 *     summary: Approve transfer (closes old allocation, creates new one)
 *     responses:
 *       200:
 *         description: Transfer approved and executed
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(transferController.approve.bind(transferController))
);

/**
 * @swagger
 * /transfers/{id}/reject:
 *   post:
 *     tags: [Transfers]
 *     summary: Reject transfer request
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
 *         description: Transfer rejected
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(transferController.reject.bind(transferController))
);

export default router;
