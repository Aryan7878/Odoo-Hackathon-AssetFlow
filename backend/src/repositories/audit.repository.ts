import { AuditItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class AuditRepository {
  async createCycle(data: Prisma.AuditCycleCreateInput) {
    return prisma.auditCycle.create({
      data,
      include: {
        department: { select: { id: true, name: true } },
        conductedBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { auditItems: true } },
      },
    });
  }

  async findCycleById(id: string) {
    return prisma.auditCycle.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        conductedBy: { select: { id: true, firstName: true, lastName: true } },
        auditItems: {
          include: {
            asset: { select: { id: true, assetTag: true, name: true, condition: true } },
          },
        },
      },
    });
  }

  async findAllCycles(params: { skip: number; take: number }) {
    const [total, cycles] = await Promise.all([
      prisma.auditCycle.count(),
      prisma.auditCycle.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          department: { select: { id: true, name: true } },
          conductedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { auditItems: true } },
        },
      }),
    ]);
    return { total, cycles };
  }

  async createAuditItems(auditCycleId: string, assetIds: string[]) {
    const items = assetIds.map((assetId) => ({ auditCycleId, assetId }));
    return prisma.auditItem.createMany({ data: items, skipDuplicates: true });
  }

  async findItemById(id: string) {
    return prisma.auditItem.findUnique({
      where: { id },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        auditCycle: { select: { id: true, title: true } },
      },
    });
  }

  async updateItem(id: string, data: Prisma.AuditItemUpdateInput) {
    return prisma.auditItem.update({ where: { id }, data });
  }

  async completeCycle(id: string) {
    return prisma.auditCycle.update({
      where: { id },
      data: { isCompleted: true, endDate: new Date() },
    });
  }

  async getDiscrepancyReport(auditCycleId: string) {
    const items = await prisma.auditItem.findMany({
      where: {
        auditCycleId,
        status: { in: [AuditItemStatus.MISSING, AuditItemStatus.DAMAGED] },
      },
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, condition: true, status: true, location: true },
        },
      },
    });

    const summary = await prisma.auditItem.groupBy({
      by: ['status'],
      where: { auditCycleId },
      _count: { _all: true },
    });

    return { items, summary };
  }
}

export const auditRepository = new AuditRepository();
