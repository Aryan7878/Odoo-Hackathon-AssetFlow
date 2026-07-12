import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class DepartmentRepository {
  async create(data: Prisma.DepartmentCreateInput) {
    return prisma.department.create({ data });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, assets: true } },
      },
    });
  }

  async findByCode(code: string) {
    return prisma.department.findUnique({ where: { code } });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    return prisma.department.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.department.delete({ where: { id } });
  }

  async findAll(params: { skip: number; take: number; search?: string }) {
    const where: Prisma.DepartmentWhereInput = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { code: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, departments] = await Promise.all([
      prisma.department.count({ where }),
      prisma.department.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { name: 'asc' },
        include: { _count: { select: { users: true, assets: true } } },
      }),
    ]);

    return { total, departments };
  }

  async count() {
    return prisma.department.count({ where: { isActive: true } });
  }
}

export const departmentRepository = new DepartmentRepository();
