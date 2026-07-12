import { AssetStatus, AllocationStatus, ActivityAction } from '@prisma/client';
import { allocationRepository } from '../repositories/allocation.repository';
import { assetRepository } from '../repositories/asset.repository';
import { userRepository } from '../repositories/user.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { AllocateAssetInput } from '../validators/allocation.validator';
import { AllocationQueryParams } from '../types';

export class AllocationService {
  async allocate(data: AllocateAssetInput, allocatedById: string) {
    const asset = await assetRepository.findById(data.assetId);
    if (!asset) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new AppError(ERROR_MESSAGES.ASSET_NOT_AVAILABLE, HTTP_STATUS.CONFLICT);
    }

    const activeAllocation = await allocationRepository.findActiveByAssetId(data.assetId);
    if (activeAllocation) {
      throw new AppError(ERROR_MESSAGES.ACTIVE_ALLOCATION_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const targetUser = await userRepository.findById(data.allocatedToId);
    if (!targetUser) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const allocation = await allocationRepository.create({
      asset: { connect: { id: data.assetId } },
      allocatedTo: { connect: { id: data.allocatedToId } },
      allocatedBy: { connect: { id: allocatedById } },
      expectedReturn: data.expectedReturn ? new Date(data.expectedReturn) : undefined,
      notes: data.notes,
      status: AllocationStatus.ACTIVE,
    });

    await assetRepository.updateStatus(data.assetId, AssetStatus.ALLOCATED);

    await activityLogRepository.create({
      userId: allocatedById,
      action: ActivityAction.ASSET_ALLOCATED,
      entityType: 'Allocation',
      entityId: allocation.id,
      details: {
        assetId: data.assetId,
        assetTag: asset.assetTag,
        allocatedTo: `${targetUser.firstName} ${targetUser.lastName}`,
      },
    });

    await notificationRepository.create({
      userId: data.allocatedToId,
      title: 'Asset Allocated to You',
      message: `Asset ${asset.assetTag} - "${asset.name}" has been allocated to you.`,
      type: 'SUCCESS',
      link: `/assets/${asset.id}`,
    });

    return allocation;
  }

  async returnAsset(id: string, returnedById: string, returnNotes?: string) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) throw new AppError(ERROR_MESSAGES.ALLOCATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (allocation.status !== AllocationStatus.ACTIVE) {
      throw new AppError('This allocation is not active', HTTP_STATUS.CONFLICT);
    }

    const updated = await allocationRepository.update(id, {
      status: AllocationStatus.RETURNED,
      returnDate: new Date(),
      returnNotes,
      returnedBy: { connect: { id: returnedById } },
    });

    await assetRepository.updateStatus(allocation.assetId, AssetStatus.AVAILABLE);

    await activityLogRepository.create({
      userId: returnedById,
      action: ActivityAction.ASSET_RETURNED,
      entityType: 'Allocation',
      entityId: id,
      details: { assetId: allocation.assetId },
    });

    return updated;
  }

  async findById(id: string) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) throw new AppError(ERROR_MESSAGES.ALLOCATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return allocation;
  }

  async findAll(query: AllocationQueryParams) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const { total, allocations } = await allocationRepository.findAll({
      skip,
      take: limit,
      status: query.status as AllocationStatus | undefined,
      assetId: query.assetId,
      userId: query.userId,
      orderBy: { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' },
    });

    return {
      data: allocations,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }
}

export const allocationService = new AllocationService();
