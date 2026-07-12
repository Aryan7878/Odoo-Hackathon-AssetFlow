import { Response } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { adminService } from '../services/admin.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';

export class AdminController {
  async getPendingUsers(req: AuthRequest, res: Response): Promise<void> {
    const users = await adminService.getPendingUsers();
    sendSuccess(res, 'Pending users fetched successfully', users);
  }

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await adminService.getAllUsers(req.query as Record<string, string>);
    sendPaginated(res, 'Users fetched successfully', data, pagination);
  }

  async approveUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await adminService.approveUser(req.params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.USER_APPROVED, user);
  }

  async rejectUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await adminService.rejectUser(req.params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.USER_REJECTED, user);
  }

  async suspendUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await adminService.suspendUser(req.params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.USER_SUSPENDED, user);
  }

  async activateUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await adminService.activateUser(req.params.id, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.USER_ACTIVATED, user);
  }

  async assignRole(req: AuthRequest, res: Response): Promise<void> {
    const { role } = req.body as { role: Role };
    const user = await adminService.assignRole(req.params.id, role, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.ROLE_UPDATED, user);
  }

  async assignDepartment(req: AuthRequest, res: Response): Promise<void> {
    const { departmentId, designation } = req.body as { departmentId: string; designation?: string };
    const user = await adminService.assignDepartment(req.params.id, departmentId, designation, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.USER_DEPARTMENT_UPDATED, user);
  }
}

export const adminController = new AdminController();
