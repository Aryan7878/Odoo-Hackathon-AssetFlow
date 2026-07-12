import { Response } from 'express';
import { AuthRequest } from '../types';
import { allocationService } from '../services/allocation.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import { allocateAssetSchema, returnAssetSchema } from '../validators/allocation.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class AllocationController {
  async allocate(req: AuthRequest, res: Response): Promise<void> {
    const { body } = allocateAssetSchema.parse({ body: req.body });
    const allocation = await allocationService.allocate(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.ALLOCATION_CREATED, allocation);
  }

  async returnAsset(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = returnAssetSchema.parse({ params: req.params, body: req.body });
    const allocation = await allocationService.returnAsset(params.id, req.user!.userId, body.returnNotes);
    sendSuccess(res, SUCCESS_MESSAGES.ALLOCATION_RETURNED, allocation);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const allocation = await allocationService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.ALLOCATION_FETCHED, allocation);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await allocationService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.ALLOCATIONS_FETCHED, data, pagination);
  }
}

export const allocationController = new AllocationController();
