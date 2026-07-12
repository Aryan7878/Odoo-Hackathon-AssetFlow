import { Response } from 'express';
import { AuthRequest } from '../types';
import { resourceService } from '../services/resource.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import { createResourceSchema, updateResourceSchema } from '../validators/resource.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class ResourceController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createResourceSchema.parse({ body: req.body });
    const resource = await resourceService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.RESOURCE_CREATED, resource);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const resource = await resourceService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.RESOURCE_FETCHED, resource);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateResourceSchema.parse({ params: req.params, body: req.body });
    const resource = await resourceService.update(params.id, body, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.RESOURCE_UPDATED, resource);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    await resourceService.delete(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.RESOURCE_DELETED, null);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await resourceService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.RESOURCES_FETCHED, data, pagination);
  }
}

export const resourceController = new ResourceController();
