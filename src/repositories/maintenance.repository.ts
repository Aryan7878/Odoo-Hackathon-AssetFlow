import { MaintenanceStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const maintenanceInclude = {
  asset: { select: { id: true, assetTag: true, name: true, status: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export class MaintenanceRepository {
  async create(data: Prisma.MaintenanceRequestCreateInput) {
    return prisma.maintenanceRequest.create({ data, include: maintenanceInclude });
  }

  async findById(id: string) {
    return prisma.maintenanceRequest.findUnique({ where: { id }, include: maintenanceInclude });
  }

  async update(id: string, data: Prisma.MaintenanceRequestUpdateInput) {
    return prisma.maintenanceRequest.update({ where: { id }, data, include: maintenanceInclude });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: MaintenanceStatus;
    assetId?: string;
    priority?: string;
    orderBy?: Prisma.MaintenanceRequestOrderByWithRelationInput;
  }) {
    const where: Prisma.MaintenanceRequestWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.assetId && { assetId: params.assetId }),
      ...(params.priority && { priority: params.priority }),
    };

    const [total, requests] = await Promise.all([
      prisma.maintenanceRequest.count({ where }),
      prisma.maintenanceRequest.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { createdAt: 'desc' },
        include: maintenanceInclude,
      }),
    ]);

    return { total, requests };
  }

  async countPending() {
    return prisma.maintenanceRequest.count({ where: { status: MaintenanceStatus.PENDING } });
  }
}

export const maintenanceRepository = new MaintenanceRepository();
