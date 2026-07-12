import { Response } from 'express';
import { AuthRequest } from '../types';
import { transferService } from '../services/transfer.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import {
  createTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
} from '../validators/transfer.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class TransferController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createTransferSchema.parse({ body: req.body });
    const transfer = await transferService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.TRANSFER_CREATED, transfer);
  }

  async approve(req: AuthRequest, res: Response): Promise<void> {
    const { params } = approveTransferSchema.parse({ params: req.params });
    const transfer = await transferService.approve(params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.TRANSFER_APPROVED, transfer);
  }

  async reject(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = rejectTransferSchema.parse({ params: req.params, body: req.body });
    const transfer = await transferService.reject(params.id, req.user!.userId, body.rejectionNote);
    sendSuccess(res, SUCCESS_MESSAGES.TRANSFER_REJECTED, transfer);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const transfer = await transferService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.TRANSFER_FETCHED, transfer);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await transferService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.TRANSFERS_FETCHED, data, pagination);
  }
}

export const transferController = new TransferController();
