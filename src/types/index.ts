import { Role } from '@prisma/client';
import { Request } from 'express';

// =============================================
// AUTH TYPES
// =============================================
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// =============================================
// PAGINATION
// =============================================
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// =============================================
// QUERY PARAMS
// =============================================
export interface BaseQueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AssetQueryParams extends BaseQueryParams {
  status?: string;
  categoryId?: string;
  departmentId?: string;
  condition?: string;
}

export interface AllocationQueryParams extends BaseQueryParams {
  status?: string;
  assetId?: string;
  userId?: string;
}

export interface BookingQueryParams extends BaseQueryParams {
  status?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaintenanceQueryParams extends BaseQueryParams {
  status?: string;
  assetId?: string;
  priority?: string;
}

// =============================================
// API RESPONSE
// =============================================
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
  stack?: string;
}

// =============================================
// DASHBOARD
// =============================================
export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  underMaintenanceAssets: number;
  retiredAssets: number;
  lostAssets: number;
  totalDepartments: number;
  totalEmployees: number;
  totalResources: number;
  bookingsToday: number;
  pendingMaintenance: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueAssets: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardCharts {
  assetsByCategory: ChartDataPoint[];
  assetsByDepartment: ChartDataPoint[];
  assetStatusDistribution: ChartDataPoint[];
  monthlyAllocationTrend: { month: string; allocations: number; returns: number }[];
  maintenanceTrend: { month: string; count: number }[];
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  userId: string | null;
  userName: string | null;
  createdAt: Date;
}
