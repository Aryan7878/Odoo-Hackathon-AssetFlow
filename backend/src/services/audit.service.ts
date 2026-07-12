import { ActivityAction } from '@prisma/client';
import { auditRepository } from '../repositories/audit.repository';
import { assetRepository } from '../repositories/asset.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { CreateAuditCycleInput } from '../validators/audit.validator';
import { AuditItemStatus } from '@prisma/client';

export class AuditService {
  async createCycle(data: CreateAuditCycleInput, userId: string) {
    const cycle = await auditRepository.createCycle({
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      conductedBy: { connect: { id: userId } },
      ...(data.departmentId && { department: { connect: { id: data.departmentId } } }),
    });

    if (data.assetIds && data.assetIds.length > 0) {
      await auditRepository.createAuditItems(cycle.id, data.assetIds);
    }

    await activityLogRepository.create({
      userId,
      action: ActivityAction.AUDIT_CREATED,
      entityType: 'AuditCycle',
      entityId: cycle.id,
      details: { title: data.title },
    });

    return cycle;
  }

  async findById(id: string) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) throw new AppError(ERROR_MESSAGES.AUDIT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return cycle;
  }

  async findAll(query: { page?: string; limit?: string }) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const { total, cycles } = await auditRepository.findAllCycles({ skip, take: limit });
    return { data: cycles, pagination: buildPaginationMeta(total, page, limit) };
  }

  async addAssets(id: string, assetIds: string[]) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) throw new AppError(ERROR_MESSAGES.AUDIT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (cycle.isCompleted) throw new AppError(ERROR_MESSAGES.AUDIT_ALREADY_COMPLETED, HTTP_STATUS.CONFLICT);

    // Validate all assets exist
    for (const assetId of assetIds) {
      const asset = await assetRepository.findById(assetId);
      if (!asset) throw new AppError(`Asset ${assetId} not found`, HTTP_STATUS.NOT_FOUND);
    }

    return auditRepository.createAuditItems(id, assetIds);
  }

  async updateItem(cycleId: string, itemId: string, status: AuditItemStatus, notes?: string) {
    const cycle = await auditRepository.findCycleById(cycleId);
    if (!cycle) throw new AppError(ERROR_MESSAGES.AUDIT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (cycle.isCompleted) throw new AppError(ERROR_MESSAGES.AUDIT_ALREADY_COMPLETED, HTTP_STATUS.CONFLICT);

    const item = await auditRepository.findItemById(itemId);
    if (!item || item.auditCycleId !== cycleId) {
      throw new AppError(ERROR_MESSAGES.AUDIT_ITEM_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return auditRepository.updateItem(itemId, {
      status,
      notes,
      verifiedAt: status !== AuditItemStatus.PENDING ? new Date() : null,
    });
  }

  async completeCycle(id: string, userId: string) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) throw new AppError(ERROR_MESSAGES.AUDIT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (cycle.isCompleted) throw new AppError(ERROR_MESSAGES.AUDIT_ALREADY_COMPLETED, HTTP_STATUS.CONFLICT);

    const completed = await auditRepository.completeCycle(id);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.AUDIT_COMPLETED,
      entityType: 'AuditCycle',
      entityId: id,
    });

    return completed;
  }

  async getDiscrepancyReport(id: string) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) throw new AppError(ERROR_MESSAGES.AUDIT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return auditRepository.getDiscrepancyReport(id);
  }
}

export const auditService = new AuditService();
