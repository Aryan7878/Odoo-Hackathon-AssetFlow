import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import assetRoutes from './asset.routes';
import allocationRoutes from './allocation.routes';
import bookingRoutes from './booking.routes';
import maintenanceRoutes from './maintenance.routes';
import transferRoutes from './transfer.routes';
import departmentRoutes from './department.routes';
import categoryRoutes from './category.routes';
import resourceRoutes from './resource.routes';
import auditRoutes from './audit.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AssetFlow API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/assets', assetRoutes);
router.use('/allocations', allocationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/transfers', transferRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/resources', resourceRoutes);
router.use('/audit', auditRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
