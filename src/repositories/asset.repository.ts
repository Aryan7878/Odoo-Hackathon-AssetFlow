import { AssetCondition, AssetStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const assetInclude = {
  category: { select: { id: true, name: true, code: true } },
  department: { select: { id: true, name: true, code: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export class AssetRepository {
  async create(data: Prisma.AssetCreateInput) {
    return prisma.asset.create({ data, include: assetInclude });
  }

  async findById(id: string) {
    return prisma.asset.findUnique({ where: { id }, include: assetInclude });
  }

  async findByAssetTag(assetTag: string) {
    return prisma.asset.findUnique({ where: { assetTag } });
  }

  async update(id: string, data: Prisma.AssetUpdateInput) {
    return prisma.asset.update({ where: { id }, data, include: assetInclude });
  }

  async delete(id: string) {
    return prisma.asset.delete({ where: { id } });
  }

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
    status?: AssetStatus;
    categoryId?: string;
    departmentId?: string;
    condition?: AssetCondition;
    orderBy?: Prisma.AssetOrderByWithRelationInput;
  }) {
    const where: Prisma.AssetWhereInput = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { assetTag: { contains: params.search, mode: 'insensitive' } },
          { serialNumber: { contains: params.search, mode: 'insensitive' } },
          { vendor: { contains: params.search, mode: 'insensitive' } },
          { location: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.status && { status: params.status }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.departmentId && { departmentId: params.departmentId }),
      ...(params.condition && { condition: params.condition }),
    };

    const [total, assets] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { createdAt: 'desc' },
        include: assetInclude,
      }),
    ]);

    return { total, assets };
  }

  async updateStatus(id: string, status: AssetStatus) {
    return prisma.asset.update({ where: { id }, data: { status } });
  }

  async getHistory(assetId: string) {
    const [allocations, maintenance, transfers] = await Promise.all([
      prisma.allocation.findMany({
        where: { assetId },
        include: {
          allocatedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          allocatedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.maintenanceRequest.findMany({
        where: { assetId },
        include: {
          requestedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transferRequest.findMany({
        where: { assetId },
        include: {
          requestedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { allocations, maintenance, transfers };
  }

  async countByStatus() {
    return prisma.asset.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  async countByCategory() {
    return prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
    });
  }

  async countByDepartment() {
    return prisma.asset.groupBy({
      by: ['departmentId'],
      _count: { _all: true },
    });
  }

  async count() {
    return prisma.asset.count();
  }
}

export const assetRepository = new AssetRepository();
