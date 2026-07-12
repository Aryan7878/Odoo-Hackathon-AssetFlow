import { ResourceType, ActivityAction } from '@prisma/client';
import { resourceRepository } from '../repositories/resource.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { CreateResourceInput, UpdateResourceInput } from '../validators/resource.validator';

export class ResourceService {
  async create(data: CreateResourceInput, userId: string) {
    const existing = await resourceRepository.findByCode(data.code);
    if (existing) throw new AppError(ERROR_MESSAGES.RESOURCE_CODE_EXISTS, HTTP_STATUS.CONFLICT);

    const resource = await resourceRepository.create(data);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.RESOURCE_CREATED,
      entityType: 'Resource',
      entityId: resource.id,
    });

    return resource;
  }

  async findById(id: string) {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw new AppError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return resource;
  }

  async update(id: string, data: UpdateResourceInput, userId: string) {
    const existing = await resourceRepository.findById(id);
    if (!existing) throw new AppError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const resource = await resourceRepository.update(id, data);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.RESOURCE_UPDATED,
      entityType: 'Resource',
      entityId: id,
    });

    return resource;
  }

  async delete(id: string) {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw new AppError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return resourceRepository.delete(id);
  }

  async findAll(query: { page?: string; limit?: string; search?: string; type?: string }) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const { total, resources } = await resourceRepository.findAll({
      skip,
      take: limit,
      search: query.search,
      type: query.type as ResourceType | undefined,
    });
    return { data: resources, pagination: buildPaginationMeta(total, page, limit) };
  }
}

export const resourceService = new ResourceService();
