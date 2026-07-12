import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { ActivityAction } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { env } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { buildPaginationMeta } from '../utils/pagination';
import { prisma } from '../config/database';

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const employeeId = await userRepository.generateEmployeeId();

    const user = await userRepository.create({
      employeeId,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: Role.EMPLOYEE,      // New users always start as EMPLOYEE
      isVerified: false,
      status: UserStatus.PENDING_APPROVAL,
      provider: 'local',
      ...(data.departmentId && {
        department: { connect: { id: data.departmentId } },
      }),
    });

    await activityLogRepository.create({
      userId: user.id,
      action: ActivityAction.USER_REGISTERED,
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });

    // Notify all admins about the new pending user
    try {
      const admins = await userRepository.findAdmins();
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'New User Pending Approval',
            message: `${user.firstName} ${user.lastName} (${user.email}) has registered and is awaiting your approval.`,
            type: 'INFO',
            link: '/admin',
          },
        });
      }
    } catch (_e) {
      // Non-critical: notification failure should not block registration
    }

    return {
      requiresApproval: true,
      user: this.sanitizeUser(user),
    };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Status checks BEFORE password validation for security
    if (user.status === UserStatus.PENDING_APPROVAL) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_PENDING_APPROVAL, HTTP_STATUS.FORBIDDEN);
    }

    if (user.status === UserStatus.REJECTED) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_REJECTED, HTTP_STATUS.FORBIDDEN);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_SUSPENDED, HTTP_STATUS.FORBIDDEN);
    }

    if (!user.isActive || user.status !== UserStatus.ACTIVE) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.FORBIDDEN);
    }

    if (!user.isVerified) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_PENDING_APPROVAL, HTTP_STATUS.FORBIDDEN);
    }

    // Google-only accounts have no password
    if (!user.password) {
      throw new AppError('This account uses Google Sign-In. Please continue with Google.', HTTP_STATUS.BAD_REQUEST);
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, refreshToken);

    await activityLogRepository.create({
      userId: user.id,
      action: ActivityAction.USER_LOGIN,
      entityType: 'User',
      entityId: user.id,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(googleProfile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }) {
    // Try to find by googleId first
    let user = await userRepository.findByGoogleId(googleProfile.googleId);

    // Fallback: find by email (user might have registered via email first)
    if (!user) {
      user = await userRepository.findByEmail(googleProfile.email);
    }

    if (!user) {
      // Create new user via Google
      const employeeId = await userRepository.generateEmployeeId();

      user = await userRepository.create({
        employeeId,
        email: googleProfile.email,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        googleId: googleProfile.googleId,
        provider: 'google',
        avatarUrl: googleProfile.avatar,
        role: Role.EMPLOYEE,
        isVerified: false,
        status: UserStatus.PENDING_APPROVAL,
      });

      await activityLogRepository.create({
        userId: user.id,
        action: ActivityAction.USER_REGISTERED,
        entityType: 'User',
        entityId: user.id,
        details: { email: user.email, provider: 'google' },
      });

      // Notify admins
      try {
        const admins = await userRepository.findAdmins();
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: 'New User Pending Approval',
              message: `${user.firstName} ${user.lastName} (${user.email}) signed in via Google and is awaiting approval.`,
              type: 'INFO',
              link: '/admin',
            },
          });
        }
      } catch (_e) {
        // Non-critical
      }

      return { requiresApproval: true, user: this.sanitizeUser(user) };
    }

    // Update googleId if user existed via email registration
    if (!user.googleId) {
      user = await userRepository.update(user.id, {
        googleId: googleProfile.googleId,
        provider: 'google',
        avatarUrl: googleProfile.avatar || user.avatarUrl,
      });
    }

    // Status checks for existing Google user
    if (user.status === UserStatus.PENDING_APPROVAL) {
      return { requiresApproval: true, user: this.sanitizeUser(user) };
    }

    if (user.status === UserStatus.REJECTED) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_REJECTED, HTTP_STATUS.FORBIDDEN);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_SUSPENDED, HTTP_STATUS.FORBIDDEN);
    }

    if (!user.isActive || user.status !== UserStatus.ACTIVE) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.FORBIDDEN);
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, refreshToken);

    await activityLogRepository.create({
      userId: user.id,
      action: ActivityAction.USER_LOGIN,
      entityType: 'User',
      entityId: user.id,
      details: { provider: 'google' },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      throw new AppError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive || user.status !== UserStatus.ACTIVE || !user.isVerified) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.FORBIDDEN);
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);

    await activityLogRepository.create({
      userId,
      action: ActivityAction.USER_LOGOUT,
      entityType: 'User',
      entityId: userId,
    });
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }

  async findAll(query: Record<string, string>) {
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

  private sanitizeUser(user: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...sanitized } = user as {
      password: string;
      refreshToken: string | null;
      [key: string]: unknown;
    };
    return sanitized;
  }
}

export const authService = new AuthService();
