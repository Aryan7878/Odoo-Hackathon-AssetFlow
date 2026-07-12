import { Response } from 'express';
import { AuthRequest } from '../types';
import { auditService } from '../services/audit.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import {
  createAuditCycleSchema,
  updateAuditItemSchema,
  addAuditItemSchema,
} from '../validators/audit.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class AuditController {
  async createCycle(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createAuditCycleSchema.parse({ body: req.body });
    const cycle = await auditService.createCycle(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.AUDIT_CREATED, cycle);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const cycle = await auditService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.AUDIT_FETCHED, cycle);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await auditService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.AUDITS_FETCHED, data, pagination);
  }

  async addAssets(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = addAuditItemSchema.parse({ params: req.params, body: req.body });
    const result = await auditService.addAssets(params.id, body.assetIds);
    sendCreated(res, 'Assets added to audit cycle', result);
  }

  async updateItem(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateAuditItemSchema.parse({ params: req.params, body: req.body });
    const item = await auditService.updateItem(params.id, params.itemId, body.status, body.notes);
    sendSuccess(res, SUCCESS_MESSAGES.AUDIT_ITEM_UPDATED, item);
  }

  async completeCycle(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const cycle = await auditService.completeCycle(params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.AUDIT_COMPLETED, cycle);
  }

  async getDiscrepancyReport(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const report = await auditService.getDiscrepancyReport(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.AUDIT_REPORT_FETCHED, report);
  }
}

export const auditController = new AuditController();
