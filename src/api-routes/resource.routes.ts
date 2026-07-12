import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /resources:
 *   get:
 *     tags: [Resources]
 *     summary: Get all bookable resources
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [MEETING_ROOM, PROJECTOR, VEHICLE, SHARED_EQUIPMENT] }
 *     responses:
 *       200:
 *         description: List of resources
 */
router.get('/', authenticate, asyncWrapper(resourceController.findAll.bind(resourceController)));

/**
 * @swagger
 * /resources:
 *   post:
 *     tags: [Resources]
 *     summary: Create a bookable resource
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, type]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               type: { type: string, enum: [MEETING_ROOM, PROJECTOR, VEHICLE, SHARED_EQUIPMENT] }
 *               description: { type: string }
 *               location: { type: string }
 *               capacity: { type: integer }
 *     responses:
 *       201:
 *         description: Resource created
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(resourceController.create.bind(resourceController))
);

router.get('/:id', authenticate, asyncWrapper(resourceController.findById.bind(resourceController)));
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(resourceController.update.bind(resourceController))
);
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  asyncWrapper(resourceController.delete.bind(resourceController))
);

export default router;
