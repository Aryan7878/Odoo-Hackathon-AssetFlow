// Central API Client for AssetFlow frontend to communicate with Express/PostgreSQL backend

const BASE_URL = 'http://localhost:5000/api/v1';

async function getAuthToken(): Promise<string> {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // Basic expiry check: simple check if we can call /auth/me or if we just use it
    return token;
  }
  
  // No token found. Perform background authentication as default administrator
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@assetflow.com',
        password: 'Password@123'
      })
    });
    
    if (!res.ok) {
      throw new Error('Background login failed');
    }
    
    const body = await res.json();
    const newToken = body.data.accessToken;
    localStorage.setItem('accessToken', newToken);
    return newToken;
  } catch (error) {
    console.error('API Client Auth Failure:', error);
    throw new Error('Authentication required');
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };
  
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    // Token might have expired. Try to force a re-login once
    localStorage.removeItem('accessToken');
    const retryToken = await getAuthToken();
    const retryHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${retryToken}`,
      ...(options.headers || {})
    };
    const retryResponse = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: retryHeaders
    });
    if (!retryResponse.ok) {
      const err = await retryResponse.json().catch(() => ({ message: 'Unauthorized request' }));
      throw new Error(err.message || 'Unauthorized');
    }
    const body = await retryResponse.json();
    return body;
  }
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(err.message || 'API Error');
  }
  
  return response.json();
}

export const apiClient = {
  // Authentication
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
      method: 'PATCH'
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
