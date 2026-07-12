import { Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

export function authorize(...roles: Role[]): RequestHandler {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });
      return;
    }

    next();
  };
}
