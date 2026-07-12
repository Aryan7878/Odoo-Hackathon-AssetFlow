import { ActivityAction, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class ActivityLogRepository {
  async create(data: {
    userId?: string;
    action: ActivityAction;
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const createData: Prisma.ActivityLogCreateInput = {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details as Prisma.InputJsonValue | undefined,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      ...(data.userId && { user: { connect: { id: data.userId } } }),
    };
    return prisma.activityLog.create({ data: createData });
  }

  async findAll(params: { skip: number; take: number; userId?: string; action?: ActivityAction }) {
    const where: Prisma.ActivityLogWhereInput = {
      ...(params.userId && { userId: params.userId }),
      ...(params.action && { action: params.action }),
    };

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    return { total, logs };
  }

  async getRecent(limit: number) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getMonthlyAllocationTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return prisma.activityLog.findMany({
      where: {
        action: { in: [ActivityAction.ASSET_ALLOCATED, ActivityAction.ASSET_RETURNED] },
        createdAt: { gte: sixMonthsAgo },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMaintenanceTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return prisma.activityLog.findMany({
      where: {
        action: ActivityAction.MAINTENANCE_REQUESTED,
        createdAt: { gte: sixMonthsAgo },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const activityLogRepository = new ActivityLogRepository();
