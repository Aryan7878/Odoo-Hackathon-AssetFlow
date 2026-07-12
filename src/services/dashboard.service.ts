import { dashboardRepository } from '../repositories/dashboard.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';

export class DashboardService {
  async getStats() {
    return dashboardRepository.getStats();
  }

  async getCharts() {
    const [
      assetsByCategory,
      assetsByDepartment,
      assetStatusDistribution,
      recentActivityLogs,
      allocationTrendLogs,
      maintenanceTrendLogs,
    ] = await Promise.all([
      dashboardRepository.getCategoryChartData(),
      dashboardRepository.getDepartmentChartData(),
      dashboardRepository.getStatusDistribution(),
      activityLogRepository.getRecent(10),
      activityLogRepository.getMonthlyAllocationTrend(),
      activityLogRepository.getMaintenanceTrend(),
    ]);

    // Build monthly allocation trend
    const monthlyAllocationTrend = this.buildMonthlyTrend(allocationTrendLogs, ['ASSET_ALLOCATED', 'ASSET_RETURNED']);
    const maintenanceTrend = this.buildMonthlyTrendSingle(maintenanceTrendLogs);

    const recentActivities = recentActivityLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType || '',
      entityId: log.entityId,
      details: log.details as Record<string, unknown> | null,
      userId: log.userId,
      userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : null,
      createdAt: log.createdAt,
    }));

    return {
      assetsByCategory,
      assetsByDepartment,
      assetStatusDistribution,
      monthlyAllocationTrend,
      maintenanceTrend,
      recentActivities,
    };
  }

  private buildMonthlyTrend(logs: { action: string; createdAt: Date }[], actions: string[]) {
    const months: Record<string, { allocations: number; returns: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { allocations: 0, returns: 0 };
    }

    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        if (log.action === 'ASSET_ALLOCATED') months[key].allocations++;
        if (log.action === 'ASSET_RETURNED') months[key].returns++;
      }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }

  private buildMonthlyTrendSingle(logs: { createdAt: Date }[]) {
    const months: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }

    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) months[key]++;
    });

    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }
}

export const dashboardService = new DashboardService();
