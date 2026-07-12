import { Response } from 'express';
import { AuthRequest } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const stats = await dashboardService.getStats();
    sendSuccess(res, SUCCESS_MESSAGES.STATS_FETCHED, stats);
  }

  async getCharts(req: AuthRequest, res: Response): Promise<void> {
    const charts = await dashboardService.getCharts();
    sendSuccess(res, SUCCESS_MESSAGES.CHARTS_FETCHED, charts);
  }
}

export const dashboardController = new DashboardController();
