import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /departments:
 *   get:
 *     tags: [Departments]
 *     summary: Get all departments
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/', authenticate, asyncWrapper(departmentController.findAll.bind(departmentController)));

/**
 * @swagger
 * /departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create department
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
 *         description: Department created
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  asyncWrapper(departmentController.create.bind(departmentController))
);

router.get('/:id', authenticate, asyncWrapper(departmentController.findById.bind(departmentController)));

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  asyncWrapper(departmentController.update.bind(departmentController))
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  asyncWrapper(departmentController.delete.bind(departmentController))
);

export default router;
