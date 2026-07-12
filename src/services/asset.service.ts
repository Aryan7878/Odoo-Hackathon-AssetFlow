import { AssetCondition, AssetStatus, ActivityAction } from '@prisma/client';
import { assetRepository } from '../repositories/asset.repository';
import { categoryRepository } from '../repositories/category.repository';
import { departmentRepository } from '../repositories/department.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { generateAssetTag } from '../utils/assetTagGenerator';
import { getPaginationParams, buildPaginationMeta, getSortParams } from '../utils/pagination';
import { CreateAssetInput, UpdateAssetInput } from '../validators/asset.validator';
import { AssetQueryParams } from '../types';

export class AssetService {
  async create(data: CreateAssetInput, createdById: string) {
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (data.departmentId) {
      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) throw new AppError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const assetTag = await generateAssetTag();

    const asset = await assetRepository.create({
      assetTag,
      name: data.name,
      description: data.description,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      purchaseCost: data.purchaseCost,
      vendor: data.vendor,
      invoiceNumber: data.invoiceNumber,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      location: data.location,
      condition: data.condition || AssetCondition.GOOD,
      imageUrl: data.imageUrl,
      category: { connect: { id: data.categoryId } },
      ...(data.departmentId && { department: { connect: { id: data.departmentId } } }),
      createdBy: { connect: { id: createdById } },
    });

    await activityLogRepository.create({
      userId: createdById,
      action: ActivityAction.ASSET_CREATED,
      entityType: 'Asset',
      entityId: asset.id,
      details: { assetTag: asset.assetTag, name: asset.name },
    });

    return asset;
  }

  async findById(id: string) {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return asset;
  }

  async update(id: string, data: UpdateAssetInput, userId: string) {
    const existing = await assetRepository.findById(id);
    if (!existing) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (data.categoryId) {
      const cat = await categoryRepository.findById(data.categoryId);
      if (!cat) throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (data.departmentId) {
      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) throw new AppError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const asset = await assetRepository.update(id, {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
      ...(data.departmentId && { department: { connect: { id: data.departmentId } } }),
    });

    await activityLogRepository.create({
      userId,
      action: ActivityAction.ASSET_UPDATED,
      entityType: 'Asset',
      entityId: id,
      details: { changes: data },
    });

    return asset;
  }

  async delete(id: string, userId: string) {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (asset.status === AssetStatus.ALLOCATED) {
      throw new AppError('Cannot delete an allocated asset', HTTP_STATUS.CONFLICT);
    }

    await assetRepository.delete(id);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.ASSET_DELETED,
      entityType: 'Asset',
      entityId: id,
      details: { assetTag: asset.assetTag, name: asset.name },
    });
  }

  async findAll(query: AssetQueryParams) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const orderBy = getSortParams(query.sortBy, query.sortOrder, [
      'name', 'assetTag', 'status', 'condition', 'purchaseCost', 'createdAt', 'updatedAt',
    ]);

    const { total, assets } = await assetRepository.findAll({
      skip,
      take: limit,
      search: query.search,
      status: query.status as AssetStatus | undefined,
      categoryId: query.categoryId,
      departmentId: query.departmentId,
      condition: query.condition as AssetCondition | undefined,
      orderBy,
    });

    return {
      data: assets,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getHistory(id: string) {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new AppError(ERROR_MESSAGES.ASSET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    const history = await assetRepository.getHistory(id);
    return { asset, history };
  }
}

export const assetService = new AssetService();
