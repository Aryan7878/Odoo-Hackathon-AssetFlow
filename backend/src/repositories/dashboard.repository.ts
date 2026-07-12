import { prisma } from '../config/database';
import { AssetStatus, MaintenanceStatus, AllocationStatus } from '@prisma/client';

export class DashboardRepository {
  async getStats() {
    const [
      assetCounts,
      totalDepartments,
      totalEmployees,
      totalResources,
      bookingsToday,
      pendingMaintenance,
      pendingTransfers,
      upcomingReturns,
      overdueAllocations,
    ] = await Promise.all([
      prisma.asset.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true, role: 'EMPLOYEE' } }),
      prisma.resource.count({ where: { isActive: true } }),
      (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return prisma.booking.count({
          where: {
            startTime: { gte: today, lt: tomorrow },
            status: { not: 'CANCELLED' },
          },
        });
      })(),
      prisma.maintenanceRequest.count({ where: { status: MaintenanceStatus.PENDING } }),
      prisma.transferRequest.count({ where: { status: 'PENDING' } }),
      (() => {
        const in7Days = new Date();
        in7Days.setDate(in7Days.getDate() + 7);
        return prisma.allocation.count({
          where: {
            status: AllocationStatus.ACTIVE,
            expectedReturn: { lte: in7Days, gte: new Date() },
          },
        });
      })(),
      prisma.allocation.count({
        where: {
          status: AllocationStatus.ACTIVE,
          expectedReturn: { lt: new Date() },
        },
      }),
    ]);

    const statusMap = Object.fromEntries(
      assetCounts.map((g) => [g.status, g._count._all])
    );

    return {
      totalAssets: Object.values(statusMap).reduce((a, b) => a + b, 0),
      availableAssets: statusMap[AssetStatus.AVAILABLE] || 0,
      allocatedAssets: statusMap[AssetStatus.ALLOCATED] || 0,
      underMaintenanceAssets: statusMap[AssetStatus.UNDER_MAINTENANCE] || 0,
      retiredAssets: statusMap[AssetStatus.RETIRED] || 0,
      lostAssets: statusMap[AssetStatus.LOST] || 0,
      totalDepartments,
      totalEmployees,
      totalResources,
      bookingsToday,
      pendingMaintenance,
      pendingTransfers,
      upcomingReturns,
      overdueAssets: overdueAllocations,
    };
  }

  async getCategoryChartData() {
    const data = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
    });

    const categories = await prisma.category.findMany({
      where: { id: { in: data.map((d) => d.categoryId) } },
      select: { id: true, name: true },
    });

    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    return data.map((d) => ({
      label: categoryMap[d.categoryId] || 'Unknown',
      value: d._count._all,
    }));
  }

  async getDepartmentChartData() {
    const data = await prisma.asset.groupBy({
      by: ['departmentId'],
      _count: { _all: true },
      where: { departmentId: { not: null } },
    });

    const departments = await prisma.department.findMany({
      where: { id: { in: data.map((d) => d.departmentId!).filter(Boolean) } },
      select: { id: true, name: true },
    });

    const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

    return data.map((d) => ({
      label: deptMap[d.departmentId!] || 'Unassigned',
      value: d._count._all,
    }));
  }

  async getStatusDistribution() {
    const data = await prisma.asset.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return data.map((d) => ({
      label: d.status,
      value: d._count._all,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
