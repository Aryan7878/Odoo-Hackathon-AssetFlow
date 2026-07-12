import { notificationRepository } from '../repositories/notification.repository';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';

export class NotificationService {
  async findAll(userId: string, query: { page?: string; limit?: string; isRead?: string }) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const isRead = query.isRead !== undefined ? query.isRead === 'true' : undefined;

    const { total, notifications } = await notificationRepository.findAllByUser(userId, {
      skip,
      take: limit,
      isRead,
    });

    const unreadCount = await notificationRepository.countUnread(userId);

    return {
      data: notifications,
      pagination: buildPaginationMeta(total, page, limit),
      unreadCount,
    };
  }

  async markRead(id: string, userId: string) {
    const count = await notificationRepository.markRead(id, userId);
    return count;
  }

  async markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  }

  async delete(id: string, userId: string) {
    return notificationRepository.delete(id, userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  }
}

export const notificationService = new NotificationService();
