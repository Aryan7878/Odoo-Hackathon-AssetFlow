import { Response } from 'express';
import { AuthRequest } from '../types';
import { assetService } from '../services/asset.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import {
  createAssetSchema,
  updateAssetSchema,
  assetIdParamSchema,
} from '../validators/asset.validator';

export class AssetController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createAssetSchema.parse({ body: req.body });
    const asset = await assetService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.ASSET_CREATED, asset);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = assetIdParamSchema.parse({ params: req.params });
    const asset = await assetService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.ASSET_FETCHED, asset);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateAssetSchema.parse({ params: req.params, body: req.body });
    const asset = await assetService.update(params.id, body, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.ASSET_UPDATED, asset);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { params } = assetIdParamSchema.parse({ params: req.params });
    await assetService.delete(params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.ASSET_DELETED, null);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await assetService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.ASSETS_FETCHED, data, pagination);
  }

  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    const { params } = assetIdParamSchema.parse({ params: req.params });
    const history = await assetService.getHistory(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.ASSET_HISTORY_FETCHED, history);
  }
}

export const assetController = new AssetController();
