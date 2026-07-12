import { AllocationStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const allocationInclude = {
  asset: {
    select: { id: true, assetTag: true, name: true, status: true, condition: true },
  },
  allocatedTo: {
    select: { id: true, firstName: true, lastName: true, email: true, employeeId: true },
  },
  allocatedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  returnedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

export class AllocationRepository {
  async create(data: Prisma.AllocationCreateInput) {
    return prisma.allocation.create({ data, include: allocationInclude });
  }

  async findById(id: string) {
    return prisma.allocation.findUnique({ where: { id }, include: allocationInclude });
  }

  async findActiveByAssetId(assetId: string) {
    return prisma.allocation.findFirst({
      where: { assetId, status: AllocationStatus.ACTIVE },
      include: allocationInclude,
    });
  }

  async update(id: string, data: Prisma.AllocationUpdateInput) {
    return prisma.allocation.update({ where: { id }, data, include: allocationInclude });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: AllocationStatus;
    assetId?: string;
    userId?: string;
    orderBy?: Prisma.AllocationOrderByWithRelationInput;
  }) {
    const where: Prisma.AllocationWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.assetId && { assetId: params.assetId }),
      ...(params.userId && { allocatedToId: params.userId }),
    };

    const [total, allocations] = await Promise.all([
      prisma.allocation.count({ where }),
      prisma.allocation.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { createdAt: 'desc' },
        include: allocationInclude,
      }),
    ]);

    return { total, allocations };
  }

  async countUpcomingReturns(days: number) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return prisma.allocation.count({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturn: { lte: futureDate, gte: new Date() },
      },
    });
  }

  async countOverdue() {
    return prisma.allocation.count({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturn: { lt: new Date() },
      },
    });
  }
}

export const allocationRepository = new AllocationRepository();
