import { TransferStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const transferInclude = {
  asset: { select: { id: true, assetTag: true, name: true, status: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export class TransferRepository {
  async create(data: Prisma.TransferRequestCreateInput) {
    return prisma.transferRequest.create({ data, include: transferInclude });
  }

  async findById(id: string) {
    return prisma.transferRequest.findUnique({ where: { id }, include: transferInclude });
  }

  async update(id: string, data: Prisma.TransferRequestUpdateInput) {
    return prisma.transferRequest.update({ where: { id }, data, include: transferInclude });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: TransferStatus;
    assetId?: string;
    orderBy?: Prisma.TransferRequestOrderByWithRelationInput;
  }) {
    const where: Prisma.TransferRequestWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.assetId && { assetId: params.assetId }),
    };

    const [total, transfers] = await Promise.all([
      prisma.transferRequest.count({ where }),
      prisma.transferRequest.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { createdAt: 'desc' },
        include: transferInclude,
      }),
    ]);

    return { total, transfers };
  }

  async countPending() {
    return prisma.transferRequest.count({ where: { status: TransferStatus.PENDING } });
  }
}

export const transferRepository = new TransferRepository();
