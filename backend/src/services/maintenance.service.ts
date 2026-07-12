import { AssetStatus, MaintenanceStatus, ActivityAction } from '@prisma/client';
import { maintenanceRepository } from '../repositories/maintenance.repository';
import { assetRepository } from '../repositories/asset.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { CreateMaintenanceInput, CompleteMaintenanceInput } from '../validators/maintenance.validator';
import { MaintenanceQueryParams } from '../types';

export class MaintenanceService {
  async create(data: CreateMaintenanceInput, requestedById: string) {
    const asset = await assetRepository.findById(data.assetId);
    if (!asset) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const request = await maintenanceRepository.create({
      asset: { connect: { id: data.assetId } },
      requestedBy: { connect: { id: requestedById } },
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      status: MaintenanceStatus.PENDING,
    });

    await activityLogRepository.create({
      userId: requestedById,
      action: ActivityAction.MAINTENANCE_REQUESTED,
      entityType: 'MaintenanceRequest',
      entityId: request.id,
      details: { assetId: data.assetId, title: data.title },
    });

    return request;
  }

  async approve(id: string, approvedById: string, assignedToId?: string, scheduledDate?: string) {
    const request = await maintenanceRepository.findById(id);
    if (!request) throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (request.status !== MaintenanceStatus.PENDING) {
      throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_PENDING, HTTP_STATUS.CONFLICT);
    }

    const updated = await maintenanceRepository.update(id, {
      status: MaintenanceStatus.APPROVED,
      approvedBy: { connect: { id: approvedById } },
      ...(assignedToId && { assignedTo: { connect: { id: assignedToId } } }),
      ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
    });

    await activityLogRepository.create({
      userId: approvedById,
      action: ActivityAction.MAINTENANCE_APPROVED,
      entityType: 'MaintenanceRequest',
      entityId: id,
    });

    await notificationRepository.create({
      userId: request.requestedById,
      title: 'Maintenance Request Approved',
      message: `Your maintenance request "${request.title}" has been approved.`,
      type: 'SUCCESS',
    });

    return updated;
  }

  async reject(id: string, approvedById: string, rejectionNote: string) {
    const request = await maintenanceRepository.findById(id);
    if (!request) throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (request.status !== MaintenanceStatus.PENDING) {
      throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_PENDING, HTTP_STATUS.CONFLICT);
    }

    const updated = await maintenanceRepository.update(id, {
      status: MaintenanceStatus.REJECTED,
      approvedBy: { connect: { id: approvedById } },
      rejectionNote,
    });

    await activityLogRepository.create({
      userId: approvedById,
      action: ActivityAction.MAINTENANCE_REJECTED,
      entityType: 'MaintenanceRequest',
      entityId: id,
    });

    await notificationRepository.create({
      userId: request.requestedById,
      title: 'Maintenance Request Rejected',
      message: `Your maintenance request "${request.title}" has been rejected. Reason: ${rejectionNote}`,
      type: 'WARNING',
    });

    return updated;
  }

  async startMaintenance(id: string, userId: string) {
    const request = await maintenanceRepository.findById(id);
    if (!request) throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (request.status !== MaintenanceStatus.APPROVED) {
      throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_APPROVED, HTTP_STATUS.CONFLICT);
    }

    const updated = await maintenanceRepository.update(id, {
      status: MaintenanceStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    await assetRepository.updateStatus(request.assetId, AssetStatus.UNDER_MAINTENANCE);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.MAINTENANCE_STARTED,
      entityType: 'MaintenanceRequest',
      entityId: id,
    });

    return updated;
  }

  async complete(id: string, data: CompleteMaintenanceInput, userId: string) {
    const request = await maintenanceRepository.findById(id);
    if (!request) throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (request.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new AppError('Maintenance must be in progress to complete', HTTP_STATUS.CONFLICT);
    }

    const updated = await maintenanceRepository.update(id, {
      status: MaintenanceStatus.COMPLETED,
      completedAt: new Date(),
      resolution: data.resolution,
      cost: data.cost,
    });

    await assetRepository.updateStatus(request.assetId, AssetStatus.AVAILABLE);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.MAINTENANCE_COMPLETED,
      entityType: 'MaintenanceRequest',
      entityId: id,
      details: { resolution: data.resolution },
    });

    return updated;
  }

  async findById(id: string) {
    const request = await maintenanceRepository.findById(id);
    if (!request) throw new AppError(ERROR_MESSAGES.MAINTENANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return request;
  }

  async findAll(query: MaintenanceQueryParams) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const { total, requests } = await maintenanceRepository.findAll({
      skip,
      take: limit,
      status: query.status as MaintenanceStatus | undefined,
      assetId: query.assetId,
      priority: query.priority,
    });

    return {
      data: requests,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }
}

export const maintenanceService = new MaintenanceService();
