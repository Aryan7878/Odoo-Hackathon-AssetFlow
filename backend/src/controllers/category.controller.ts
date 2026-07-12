import { Response } from 'express';
import { AuthRequest } from '../types';
import { categoryService } from '../services/category.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class CategoryController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createCategorySchema.parse({ body: req.body });
    const category = await categoryService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.CATEGORY_CREATED, category);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const category = await categoryService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.CATEGORY_FETCHED, category);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateCategorySchema.parse({ params: req.params, body: req.body });
    const category = await categoryService.update(params.id, body, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.CATEGORY_UPDATED, category);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    await categoryService.delete(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.CATEGORY_DELETED, null);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await categoryService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.CATEGORIES_FETCHED, data, pagination);
  }
}

export const categoryController = new CategoryController();
