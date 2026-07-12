import { Prisma, ResourceType } from '@prisma/client';
import { prisma } from '../config/database';

export class ResourceRepository {
  async create(data: Prisma.ResourceCreateInput) {
    return prisma.resource.create({ data });
  }

  async findById(id: string) {
    return prisma.resource.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
  }

  async findByCode(code: string) {
    return prisma.resource.findUnique({ where: { code } });
  }

  async update(id: string, data: Prisma.ResourceUpdateInput) {
    return prisma.resource.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.resource.delete({ where: { id } });
  }

  async findAll(params: { skip: number; take: number; search?: string; type?: ResourceType }) {
    const where: Prisma.ResourceWhereInput = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { code: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.type && { type: params.type }),
    };

    const [total, resources] = await Promise.all([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { name: 'asc' },
        include: { _count: { select: { bookings: true } } },
      }),
    ]);

    return { total, resources };
  }

  async count() {
    return prisma.resource.count({ where: { isActive: true } });
  }
}

export const resourceRepository = new ResourceRepository();
