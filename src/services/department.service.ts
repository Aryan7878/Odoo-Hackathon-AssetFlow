import { departmentRepository } from '../repositories/department.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { ActivityAction } from '@prisma/client';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../validators/department.validator';

export class DepartmentService {
  async create(data: CreateDepartmentInput, userId: string) {
    const existing = await departmentRepository.findByCode(data.code.toUpperCase());
    if (existing) throw new AppError(ERROR_MESSAGES.DEPARTMENT_CODE_EXISTS, HTTP_STATUS.CONFLICT);

    const department = await departmentRepository.create({
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description,
      managerId: data.managerId,
    });

    await activityLogRepository.create({
      userId,
      action: ActivityAction.DEPARTMENT_CREATED,
      entityType: 'Department',
      entityId: department.id,
    });

    return department;
  }

  async findById(id: string) {
    const department = await departmentRepository.findById(id);
    if (!department) throw new AppError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return department;
  }

  async update(id: string, data: UpdateDepartmentInput, userId: string) {
    const existing = await departmentRepository.findById(id);
    if (!existing) throw new AppError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const department = await departmentRepository.update(id, data);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.DEPARTMENT_UPDATED,
      entityType: 'Department',
      entityId: id,
    });

    return department;
  }

  async delete(id: string) {
    const department = await departmentRepository.findById(id);
    if (!department) throw new AppError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (department._count.users > 0) {
      throw new AppError('Cannot delete department with active employees', HTTP_STATUS.CONFLICT);
    }
    if (department._count.assets > 0) {
      throw new AppError('Cannot delete department with assigned assets', HTTP_STATUS.CONFLICT);
    }

    return departmentRepository.delete(id);
  }

  async findAll(query: { page?: string; limit?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const { total, departments } = await departmentRepository.findAll({
      skip,
      take: limit,
      search: query.search,
    });
    return { data: departments, pagination: buildPaginationMeta(total, page, limit) };
  }
}

export const departmentService = new DepartmentService();
