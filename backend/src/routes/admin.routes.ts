import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { asyncWrapper } from '../utils/asyncWrapper';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/users/pending', asyncWrapper(adminController.getPendingUsers.bind(adminController)));
router.get('/users', asyncWrapper(adminController.getAllUsers.bind(adminController)));
router.patch('/users/:id/approve', asyncWrapper(adminController.approveUser.bind(adminController)));
router.patch('/users/:id/reject', asyncWrapper(adminController.rejectUser.bind(adminController)));
router.patch('/users/:id/suspend', asyncWrapper(adminController.suspendUser.bind(adminController)));
router.patch('/users/:id/activate', asyncWrapper(adminController.activateUser.bind(adminController)));
router.patch('/users/:id/assign-role', asyncWrapper(adminController.assignRole.bind(adminController)));
router.patch('/users/:id/assign-department', asyncWrapper(adminController.assignDepartment.bind(adminController)));

export default router;
