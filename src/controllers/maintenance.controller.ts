import { Response } from 'express';
import { AuthRequest } from '../types';
import { maintenanceService } from '../services/maintenance.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import {
  createMaintenanceSchema,
  approveMaintenanceSchema,
  rejectMaintenanceSchema,
  completeMaintenanceSchema,
  updateMaintenanceSchema,
} from '../validators/maintenance.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class MaintenanceController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createMaintenanceSchema.parse({ body: req.body });
    const request = await maintenanceService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.MAINTENANCE_CREATED, request);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateMaintenanceSchema.parse({ params: req.params, body: req.body });
    // Verify it exists first
    await maintenanceService.findById(params.id);
    // Apply partial update fields through the repository
    const { maintenanceRepository } = await import('../repositories/maintenance.repository');
    const result = await maintenanceRepository.update(params.id, {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.priority && { priority: body.priority }),
      ...(body.scheduledDate && { scheduledDate: new Date(body.scheduledDate) }),
    });
    sendSuccess(res, SUCCESS_MESSAGES.MAINTENANCE_UPDATED, result);
  }

  async approve(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = approveMaintenanceSchema.parse({ params: req.params, body: req.body });
    const request = await maintenanceService.approve(
      params.id,
      req.user!.userId,
      body.assignedToId,
      body.scheduledDate
    );
    sendSuccess(res, SUCCESS_MESSAGES.MAINTENANCE_APPROVED, request);
  }

  async reject(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = rejectMaintenanceSchema.parse({ params: req.params, body: req.body });
    const request = await maintenanceService.reject(params.id, req.user!.userId, body.rejectionNote);
    sendSuccess(res, SUCCESS_MESSAGES.MAINTENANCE_REJECTED, request);
  }

  async startMaintenance(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const request = await maintenanceService.startMaintenance(params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.MAINTENANCE_STARTED, request);
  }

  async complete(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = completeMaintenanceSchema.parse({ params: req.params, body: req.body });
    const request = await maintenanceService.complete(params.id, body, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.MAINTENANCE_COMPLETED, request);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const request = await maintenanceService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.MAINTENANCE_FETCHED, request);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await maintenanceService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.MAINTENANCES_FETCHED, data, pagination);
  }
}

export const maintenanceController = new MaintenanceController();
