import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/authenticate';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     description: Returns aggregate counts for assets, employees, bookings, maintenance, and more
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssets: { type: integer }
 *                     availableAssets: { type: integer }
 *                     allocatedAssets: { type: integer }
 *                     underMaintenanceAssets: { type: integer }
 *                     retiredAssets: { type: integer }
 *                     lostAssets: { type: integer }
 *                     totalDepartments: { type: integer }
 *                     totalEmployees: { type: integer }
 *                     totalResources: { type: integer }
 *                     bookingsToday: { type: integer }
 *                     pendingMaintenance: { type: integer }
 *                     pendingTransfers: { type: integer }
 *                     upcomingReturns: { type: integer }
 *                     overdueAssets: { type: integer }
 */
router.get('/stats', authenticate, asyncWrapper(dashboardController.getStats.bind(dashboardController)));

/**
 * @swagger
 * /dashboard/charts:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard chart data
 *     description: Returns data for multiple charts including trends and distributions
 *     responses:
 *       200:
 *         description: Chart data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     assetsByCategory: { type: array }
 *                     assetsByDepartment: { type: array }
 *                     assetStatusDistribution: { type: array }
 *                     monthlyAllocationTrend: { type: array }
 *                     maintenanceTrend: { type: array }
 *                     recentActivities: { type: array }
 */
router.get('/charts', authenticate, asyncWrapper(dashboardController.getCharts.bind(dashboardController)));

export default router;
