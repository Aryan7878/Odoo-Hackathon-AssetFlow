import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } },
    });
  }

  async findByCode(code: string) {
    return prisma.category.findUnique({ where: { code } });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  async findAll(params: { skip: number; take: number; search?: string }) {
    const where: Prisma.CategoryWhereInput = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { code: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { name: 'asc' },
        include: { _count: { select: { assets: true } } },
      }),
    ]);

    return { total, categories };
  }
}

export const categoryRepository = new CategoryRepository();
