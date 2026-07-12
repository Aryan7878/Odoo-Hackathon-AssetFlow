import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories with asset counts
 */
router.get('/', authenticate, asyncWrapper(categoryController.findAll.bind(categoryController)));

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(categoryController.create.bind(categoryController))
);

router.get('/:id', authenticate, asyncWrapper(categoryController.findById.bind(categoryController)));
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.ASSET_MANAGER),
  asyncWrapper(categoryController.update.bind(categoryController))
);
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  asyncWrapper(categoryController.delete.bind(categoryController))
);

export default router;
