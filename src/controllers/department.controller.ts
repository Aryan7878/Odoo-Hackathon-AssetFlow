import { Response } from 'express';
import { AuthRequest } from '../types';
import { departmentService } from '../services/department.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class DepartmentController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createDepartmentSchema.parse({ body: req.body });
    const dept = await departmentService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.DEPARTMENT_CREATED, dept);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const dept = await departmentService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.DEPARTMENT_FETCHED, dept);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateDepartmentSchema.parse({ params: req.params, body: req.body });
    const dept = await departmentService.update(params.id, body, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.DEPARTMENT_UPDATED, dept);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    await departmentService.delete(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.DEPARTMENT_DELETED, null);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await departmentService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.DEPARTMENTS_FETCHED, data, pagination);
  }
}

export const departmentController = new DepartmentController();
