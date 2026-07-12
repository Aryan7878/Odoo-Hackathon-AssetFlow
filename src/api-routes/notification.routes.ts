import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/authenticate';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get current user's notifications
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Notifications with unread count
 */
router.get('/', authenticate, asyncWrapper(notificationController.findAll.bind(notificationController)));

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count', authenticate, asyncWrapper(notificationController.getUnreadCount.bind(notificationController)));

/**
 * @swagger
 * /notifications/mark-all-read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.post('/mark-all-read', authenticate, asyncWrapper(notificationController.markAllRead.bind(notificationController)));

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 */
router.post('/:id/read', authenticate, asyncWrapper(notificationController.markRead.bind(notificationController)));

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 */
router.delete('/:id', authenticate, asyncWrapper(notificationController.delete.bind(notificationController)));

export default router;
