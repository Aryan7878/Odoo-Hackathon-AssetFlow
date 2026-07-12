// Central API Client for AssetFlow frontend to communicate with Express/PostgreSQL backend

const BASE_URL = 'http://localhost:5000/api/v1';

async function getAuthToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const token = localStorage.getItem('accessToken');
  if (token) {
    return token;
  }
  throw new Error('No active session. Please log in.');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = '';
  try {
    token = await getAuthToken();
  } catch (err) {
    // If not authenticated and not calling auth endpoints, redirect
    if (!path.startsWith('/auth/login') && !path.startsWith('/auth/register') && !path.startsWith('/auth/refresh')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (refreshRes.ok) {
            const body = await refreshRes.json();
            localStorage.setItem('accessToken', body.data.accessToken);
            localStorage.setItem('refreshToken', body.data.refreshToken);

            // Retry the request
            const retryHeaders = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${body.data.accessToken}`,
              ...(options.headers || {})
            };
            const retryResponse = await fetch(`${BASE_URL}${path}`, {
              ...options,
              headers: retryHeaders
            });
            if (!retryResponse.ok) {
              const errBody = await retryResponse.json().catch(() => ({ message: 'API retry failed' }));
              throw new Error(errBody.message || 'API Error');
            }
            return retryResponse.json();
          }
        } catch (e) {
          // Clear credentials and redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(err.message || 'API Error');
  }

  return response.json();
}

export const apiClient = {
  // Authentication
  async login(data: any) {
    return apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async register(data: any) {
    return apiFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async logout() {
    return apiFetch<any>('/auth/logout', {
      method: 'POST'
    });
  },

  async getMe() {
    const res = await apiFetch<any>('/auth/me');
    return res.data;
  },

  async getEmployees(params: { page?: number; limit?: number; search?: string; departmentId?: string; role?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.departmentId) query.append('departmentId', params.departmentId);
    if (params.role) query.append('role', params.role);

    return apiFetch<any>(`/auth/users?${query.toString()}`);
  },

  // Admin User Management
  async getPendingUsers() {
    const res = await apiFetch<any>('/admin/users/pending');
    return res.data;
  },

  async adminGetUsers(params: { page?: number; limit?: number; search?: string; departmentId?: string; role?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.departmentId) query.append('departmentId', params.departmentId);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);

    const res = await apiFetch<any>(`/admin/users?${query.toString()}`);
    return res;
  },

  async approveUser(id: string) {
    const res = await apiFetch<any>(`/admin/users/${id}/approve`, {
      method: 'PATCH'
    });
    return res.data;
  },

  async rejectUser(id: string) {
    const res = await apiFetch<any>(`/admin/users/${id}/reject`, {
      method: 'PATCH'
    });
    return res.data;
  },

  async suspendUser(id: string) {
    const res = await apiFetch<any>(`/admin/users/${id}/suspend`, {
      method: 'PATCH'
    });
    return res.data;
  },

  async activateUser(id: string) {
    const res = await apiFetch<any>(`/admin/users/${id}/activate`, {
      method: 'PATCH'
    });
    return res.data;
  },

  async assignRole(id: string, role: string) {
    const res = await apiFetch<any>(`/admin/users/${id}/assign-role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
    return res.data;
  },

  async assignDepartment(id: string, departmentId: string, designation?: string) {
    const res = await apiFetch<any>(`/admin/users/${id}/assign-department`, {
      method: 'PATCH',
      body: JSON.stringify({ departmentId, designation })
    });
    return res.data;
  },


  // Dashboard
  async getDashboardStats() {
    const res = await apiFetch<any>('/dashboard/stats');
    return res.data;
  },
  
  async getDashboardCharts() {
    const res = await apiFetch<any>('/dashboard/charts');
    return res.data;
  },

  // Assets
  async getAssets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    departmentId?: string;
    condition?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status.toUpperCase());
    if (params.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    if (params.departmentId && params.departmentId !== 'all') query.append('departmentId', params.departmentId);
    if (params.condition && params.condition !== 'all') query.append('condition', params.condition.toUpperCase());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    
    return apiFetch<any>(`/assets?${query.toString()}`);
  },
  
  async getAssetById(id: string) {
    const res = await apiFetch<any>(`/assets/${id}`);
    return res.data;
  },
  
  async createAsset(data: any) {
    const res = await apiFetch<any>('/assets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async updateAsset(id: string, data: any) {
    const res = await apiFetch<any>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async deleteAsset(id: string) {
    return apiFetch<any>(`/assets/${id}`, {
      method: 'DELETE'
    });
  },
  
  async getAssetHistory(id: string) {
    const res = await apiFetch<any>(`/assets/${id}/history`);
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await apiFetch<any>('/categories');
    return res.data;
  },

  // Departments
  async getDepartments() {
    const res = await apiFetch<any>('/departments');
    return res.data;
  },

  // Allocations
  async getAllocations(params: { page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status && params.status !== 'all') query.append('status', params.status.toUpperCase());
    
    return apiFetch<any>(`/allocations?${query.toString()}`);
  },
  
  async createAllocation(data: { assetId: string; allocatedToId: string; expectedReturn?: string; notes?: string }) {
    const res = await apiFetch<any>('/allocations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async returnAllocation(id: string, returnNotes?: string) {
    const res = await apiFetch<any>(`/allocations/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ returnNotes })
    });
    return res.data;
  },

  // Bookings
  async getBookings() {
    const res = await apiFetch<any>('/bookings');
    return res.data;
  },
  
  async createBooking(data: { resourceId: string; title: string; description?: string; startTime: string; endTime: string; attendees?: number }) {
    const res = await apiFetch<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async cancelBooking(id: string, cancelNote?: string) {
    const res = await apiFetch<any>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancelNote })
    });
    return res.data;
  },

  // Resources
  async getResources() {
    const res = await apiFetch<any>('/resources');
    return res.data;
  },

  // Maintenance
  async getMaintenanceRequests(params: { status?: string; priority?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status.toUpperCase());
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority.toUpperCase());
    
    const res = await apiFetch<any>(`/maintenance?${query.toString()}`);
    return res.data;
  },
  
  async createMaintenanceRequest(data: { assetId: string; title: string; description: string; priority?: string }) {
    const res = await apiFetch<any>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async approveMaintenance(id: string, data: { assignedToId?: string; scheduledDate?: string }) {
    const res = await apiFetch<any>(`/maintenance/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async rejectMaintenance(id: string, rejectionNote: string) {
    const res = await apiFetch<any>(`/maintenance/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionNote })
    });
    return res.data;
  },
  
  async startMaintenance(id: string) {
    const res = await apiFetch<any>(`/maintenance/${id}/start`, {
      method: 'POST'
    });
    return res.data;
  },
  
  async completeMaintenance(id: string, data: { resolution: string; cost?: number }) {
    const res = await apiFetch<any>(`/maintenance/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Transfer requests
  async getTransferRequests() {
    const res = await apiFetch<any>('/transfers');
    return res.data;
  },
  
  async createTransferRequest(data: { assetId: string; toUserId: string; reason: string }) {
    const res = await apiFetch<any>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },
  
  async approveTransfer(id: string) {
    const res = await apiFetch<any>(`/transfers/${id}/approve`, {
      method: 'POST'
    });
    return res.data;
  },
  
  async rejectTransfer(id: string, rejectionNote?: string) {
    const res = await apiFetch<any>(`/transfers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionNote })
    });
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await apiFetch<any>('/notifications');
    return res.data;
  },
  
  async markNotificationRead(id: string) {
    const res = await apiFetch<any>(`/notifications/${id}/read`, {
      method: 'POST'
    });
    return res.data;
  },

  async markAllNotificationsRead() {
    const res = await apiFetch<any>('/notifications/mark-all-read', {
      method: 'POST'
    });
    return res.data;
  },


  // Audits
  async getAuditCycles() {
    const res = await apiFetch<any>('/audit');
    return res.data;
  },

  async createAuditCycle(data: { title: string; description?: string; departmentId?: string; startDate: string; endDate?: string; assetIds?: string[] }) {
    const res = await apiFetch<any>('/audit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async getAuditCycleById(cycleId: string) {
    const res = await apiFetch<any>(`/audit/${cycleId}`);
    return res.data;
  },

  async verifyAuditItem(cycleId: string, itemId: string, status: string, notes?: string) {
    const res = await apiFetch<any>(`/audit/${cycleId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
    return res.data;
  },

  async completeAuditCycle(cycleId: string) {
    const res = await apiFetch<any>(`/audit/${cycleId}/complete`, {
      method: 'POST'
    });
    return res.data;
  }
};
