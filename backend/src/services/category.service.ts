import { categoryRepository } from '../repositories/category.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { ActivityAction } from '@prisma/client';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export class CategoryService {
  async create(data: CreateCategoryInput, userId: string) {
    const existing = await categoryRepository.findByCode(data.code.toUpperCase());
    if (existing) throw new AppError(ERROR_MESSAGES.CATEGORY_CODE_EXISTS, HTTP_STATUS.CONFLICT);

    const category = await categoryRepository.create({
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description,
    });

    await activityLogRepository.create({
      userId,
      action: ActivityAction.CATEGORY_CREATED,
      entityType: 'Category',
      entityId: category.id,
    });

    return category;
  }

  async findById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return category;
  }

  async update(id: string, data: UpdateCategoryInput, userId: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const category = await categoryRepository.update(id, data);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.CATEGORY_UPDATED,
      entityType: 'Category',
      entityId: id,
    });

    return category;
  }

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (category._count.assets > 0) {
      throw new AppError('Cannot delete category with assigned assets', HTTP_STATUS.CONFLICT);
    }

    return categoryRepository.delete(id);
  }

  async findAll(query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const { total, categories } = await categoryRepository.findAll({
      skip, take: limit, search: query.search,
    });
    return { data: categories, pagination: buildPaginationMeta(total, page, limit) };
  }
}

export const categoryService = new CategoryService();
