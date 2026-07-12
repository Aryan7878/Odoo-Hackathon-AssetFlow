import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { UserStatus } from '@prisma/client';

export async function authenticate(req: any, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.TOKEN_REQUIRED,
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.TOKEN_REQUIRED,
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true, status: true, isVerified: true },
    });

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
      return;
    }

    if (user.status === UserStatus.PENDING_APPROVAL) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_PENDING_APPROVAL,
      });
      return;
    }

    if (user.status === UserStatus.REJECTED) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Your registration request was rejected.",
      });
      return;
    }

    if (user.status === UserStatus.SUSPENDED) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Your account has been suspended. Contact your administrator.",
      });
      return;
    }

    if (!user.isActive || user.status !== UserStatus.ACTIVE || !user.isVerified) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_INACTIVE,
      });
      return;
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
}
