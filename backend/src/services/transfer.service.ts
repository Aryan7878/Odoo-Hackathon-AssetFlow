import { TransferStatus, AllocationStatus, AssetStatus, ActivityAction } from '@prisma/client';
import { transferRepository } from '../repositories/transfer.repository';
import { allocationRepository } from '../repositories/allocation.repository';
import { assetRepository } from '../repositories/asset.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { CreateTransferInput } from '../validators/transfer.validator';

export class TransferService {
  async create(data: CreateTransferInput, requestedById: string) {
    const asset = await assetRepository.findById(data.assetId);
    if (!asset) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const currentAllocation = await allocationRepository.findActiveByAssetId(data.assetId);

    const transfer = await transferRepository.create({
      asset: { connect: { id: data.assetId } },
      requestedBy: { connect: { id: requestedById } },
      toUserId: data.toUserId,
      fromUserId: currentAllocation?.allocatedToId,
      fromDeptId: data.toDeptId ? asset.departmentId ?? undefined : undefined,
      toDeptId: data.toDeptId,
      reason: data.reason,
      status: TransferStatus.PENDING,
    });

    await activityLogRepository.create({
      userId: requestedById,
      action: ActivityAction.TRANSFER_REQUESTED,
      entityType: 'TransferRequest',
      entityId: transfer.id,
      details: { assetId: data.assetId, toUserId: data.toUserId },
    });

    return transfer;
  }

  async approve(id: string, approvedById: string) {
    const transfer = await transferRepository.findById(id);
    if (!transfer) throw new AppError(ERROR_MESSAGES.TRANSFER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new AppError(ERROR_MESSAGES.TRANSFER_NOT_PENDING, HTTP_STATUS.CONFLICT);
    }

    // Close existing allocation if any
    const currentAllocation = await allocationRepository.findActiveByAssetId(transfer.assetId);
    if (currentAllocation) {
      await allocationRepository.update(currentAllocation.id, {
        status: AllocationStatus.RETURNED,
        returnDate: new Date(),
        returnNotes: `Transferred via Transfer Request #${id}`,
      });
    }

    // Create new allocation
    await allocationRepository.create({
      asset: { connect: { id: transfer.assetId } },
      allocatedTo: { connect: { id: transfer.toUserId } },
      allocatedBy: { connect: { id: approvedById } },
      status: AllocationStatus.ACTIVE,
      notes: `Transferred via Transfer Request. Reason: ${transfer.reason}`,
    });

    // Update asset department if provided
    if (transfer.toDeptId) {
      await assetRepository.update(transfer.assetId, {
        department: { connect: { id: transfer.toDeptId } },
        status: AssetStatus.ALLOCATED,
      });
    } else {
      await assetRepository.updateStatus(transfer.assetId, AssetStatus.ALLOCATED);
    }

    const updated = await transferRepository.update(id, {
      status: TransferStatus.APPROVED,
      approvedBy: { connect: { id: approvedById } },
      resolvedAt: new Date(),
    });

    await activityLogRepository.create({
      userId: approvedById,
      action: ActivityAction.TRANSFER_APPROVED,
      entityType: 'TransferRequest',
      entityId: id,
    });

    await notificationRepository.create({
      userId: transfer.requestedById,
      title: 'Transfer Request Approved',
      message: `Transfer request for asset has been approved and executed.`,
      type: 'SUCCESS',
    });

    return updated;
  }

  async reject(id: string, approvedById: string, rejectionNote: string) {
    const transfer = await transferRepository.findById(id);
    if (!transfer) throw new AppError(ERROR_MESSAGES.TRANSFER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new AppError(ERROR_MESSAGES.TRANSFER_NOT_PENDING, HTTP_STATUS.CONFLICT);
    }

    const updated = await transferRepository.update(id, {
      status: TransferStatus.REJECTED,
      approvedBy: { connect: { id: approvedById } },
      rejectionNote,
      resolvedAt: new Date(),
    });

    await activityLogRepository.create({
      userId: approvedById,
      action: ActivityAction.TRANSFER_REJECTED,
      entityType: 'TransferRequest',
      entityId: id,
    });

    return updated;
  }

  async findById(id: string) {
    const transfer = await transferRepository.findById(id);
    if (!transfer) throw new AppError(ERROR_MESSAGES.TRANSFER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return transfer;
  }

  async findAll(query: { page?: string; limit?: string; status?: string; assetId?: string }) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const { total, transfers } = await transferRepository.findAll({
      skip,
      take: limit,
      status: query.status as TransferStatus | undefined,
      assetId: query.assetId,
    });

    return {
      data: transfers,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }
}

export const transferService = new TransferService();
