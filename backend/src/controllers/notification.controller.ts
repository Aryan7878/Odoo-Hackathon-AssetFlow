import { Response } from 'express';
import { AuthRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class NotificationController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination, unreadCount } = await notificationService.findAll(
      req.user!.userId,
      req.query as Record<string, string>
    );
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.NOTIFICATIONS_FETCHED,
      data,
      pagination,
      unreadCount,
    });
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    sendSuccess(res, 'Unread count fetched', { count });
  }

  async markRead(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    await notificationService.markRead(params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.NOTIFICATION_READ, null);
  }

  async markAllRead(req: AuthRequest, res: Response): Promise<void> {
    await notificationService.markAllRead(req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.ALL_NOTIFICATIONS_READ, null);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    await notificationService.delete(params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.NOTIFICATION_DELETED, null);
  }
}

export const notificationController = new NotificationController();
