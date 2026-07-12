import { Response } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    const { body } = registerSchema.parse({ body: req.body });
    const result = await authService.register(body);
    sendCreated(res, SUCCESS_MESSAGES.REGISTER_SUCCESS, result);
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    const { body } = loginSchema.parse({ body: req.body });
    const result = await authService.login(body);
    sendSuccess(res, SUCCESS_MESSAGES.LOGIN_SUCCESS, result);
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    const { body } = refreshTokenSchema.parse({ body: req.body });
    const tokens = await authService.refreshToken(body.refreshToken);
    sendSuccess(res, SUCCESS_MESSAGES.TOKEN_REFRESHED, tokens);
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    await authService.logout(req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.LOGOUT_SUCCESS, null);
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await authService.getCurrentUser(req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.USER_FETCHED, user);
  }

  async findAllUsers(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await authService.findAll(req.query as Record<string, string>);
    sendPaginated(res, 'Users fetched successfully', data, pagination);
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const { firstName, lastName, phone } = req.body;
    const user = await authService.updateProfile(req.user!.userId, { firstName, lastName, phone });
    sendSuccess(res, 'Profile updated successfully', user);
  }
}

export const authController = new AuthController();
