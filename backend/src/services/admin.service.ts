import { Role, UserStatus } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { ActivityAction } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { buildPaginationMeta } from '../utils/pagination';
import { prisma } from '../config/database';

export class AdminService {
  async getPendingUsers() {
    return userRepository.findByStatus(UserStatus.PENDING_APPROVAL);
  }

  async getAllUsers(query: Record<string, string>) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const { total, users } = await userRepository.findAll({
      skip,
      take: limit,
      search: query.search,
      departmentId: query.departmentId,
      role: query.role,
      status: query.status,
    });

    return {
      data: users,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async approveUser(userId: string, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const updated = await userRepository.approveUser(userId, adminId);

    // Notify the user they were approved
    try {
      await prisma.notification.create({
        data: {
          userId: userId,
          title: 'Account Approved',
          message: 'Your account has been approved by an administrator. You can now log in.',
          type: 'SUCCESS',
          link: '/login',
        },
      });
    } catch (_e) {
      // Non-critical
    }

    await activityLogRepository.create({
      userId: adminId,
      action: ActivityAction.USER_APPROVED,
      entityType: 'User',
      entityId: userId,
      details: { approvedUserId: userId, email: user.email },
    });

    return this.sanitizeUser(updated);
  }

  async rejectUser(userId: string, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const updated = await userRepository.rejectUser(userId, adminId);

    // Notify the user they were rejected
    try {
      await prisma.notification.create({
        data: {
          userId: userId,
          title: 'Account Registration Rejected',
          message: 'Your account registration request has been rejected. Please contact your administrator for more information.',
          type: 'ERROR',
        },
      });
    } catch (_e) {
      // Non-critical
    }

    await activityLogRepository.create({
      userId: adminId,
      action: ActivityAction.USER_REJECTED,
      entityType: 'User',
      entityId: userId,
      details: { rejectedUserId: userId, email: user.email },
    });

    return this.sanitizeUser(updated);
  }

  async suspendUser(userId: string, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (user.role === Role.ADMIN) {
      throw new AppError('Cannot suspend an admin account.', HTTP_STATUS.FORBIDDEN);
    }

    const updated = await userRepository.suspendUser(userId);

    // Notify the user
    try {
      await prisma.notification.create({
        data: {
          userId: userId,
          title: 'Account Suspended',
          message: 'Your account has been suspended. Please contact your administrator.',
          type: 'WARNING',
        },
      });
    } catch (_e) {
      // Non-critical
    }

    await activityLogRepository.create({
      userId: adminId,
      action: ActivityAction.USER_SUSPENDED,
      entityType: 'User',
      entityId: userId,
      details: { suspendedUserId: userId, email: user.email },
    });

    return this.sanitizeUser(updated);
  }

  async activateUser(userId: string, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const updated = await userRepository.activateUser(userId);

    await activityLogRepository.create({
      userId: adminId,
      action: ActivityAction.USER_ACTIVATED,
      entityType: 'User',
      entityId: userId,
      details: { activatedUserId: userId, email: user.email },
    });

    return this.sanitizeUser(updated);
  }

  async assignRole(userId: string, role: Role, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const updated = await userRepository.updateRole(userId, role);

    await activityLogRepository.create({
      userId: adminId,
      action: ActivityAction.USER_APPROVED,
      entityType: 'User',
      entityId: userId,
      details: { userId, newRole: role, prevRole: user.role },
    });

    return this.sanitizeUser(updated);
  }

  async assignDepartment(userId: string, departmentId: string, designation: string | undefined, adminId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const updated = await userRepository.updateDepartment(userId, departmentId, designation);

    await activityLogRepository.create({
      userId: adminId,
      action: ActivityAction.DEPARTMENT_UPDATED,
      entityType: 'User',
      entityId: userId,
      details: { userId, departmentId, designation },
    });

    return this.sanitizeUser(updated);
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const { password: _p, refreshToken: _r, ...sanitized } = user as {
      password: string;
      refreshToken: string | null;
      [key: string]: unknown;
    };
    return sanitized;
  }
}

export const adminService = new AdminService();
