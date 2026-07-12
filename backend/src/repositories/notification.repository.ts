import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class NotificationRepository {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }) {
    return prisma.notification.create({ data });
  }

  async findAllByUser(userId: string, params: { skip: number; take: number; isRead?: boolean }) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(params.isRead !== undefined && { isRead: params.isRead }),
    };

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, notifications };
  }

  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  }
}

export const notificationRepository = new NotificationRepository();
