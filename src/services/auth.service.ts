import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { ActivityAction } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { env } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

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
      role: data.role || Role.EMPLOYEE,
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

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.FORBIDDEN);
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

    if (!user.isActive) {
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
