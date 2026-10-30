/**
 * EDUCORE Universal REST API Client
 * Proxied via Vite to Laravel 11 Backend (http://127.0.0.1:8000/api/v1)
 */

declare global {
  interface Window {
    __EDUCORE_API_URL__?: string;
  }
}

export function getApiBase(): string {
  if (typeof window !== 'undefined' && window.__EDUCORE_API_URL__) {
    return window.__EDUCORE_API_URL__.replace(/\/$/, '');
  }
  const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }
  return '/api/v1';
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('educore_auth_token');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('educore_auth_token', token);
  } else {
    localStorage.removeItem('educore_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const base = getApiBase();
  const response = await fetch(`${base}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || (typeof data === 'string' ? data : `Request failed with status ${response.status}`);
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // 1. Authentication & Onboarding
  auth: {
    async login(email: string, password?: string) {
      const res = await request<{ message: string; token: string; user: any; tenant_memberships: any[]; company_memberships: any[] }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password: password || 'EducoreSecurePass123!' }),
        }
      );
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },

    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // ignore logout errors on client teardown
      } finally {
        setAuthToken(null);
      }
    },

    async registerSchool(payload: {
      name: string;
      institution_type: string;
      registration_number?: string;
      email: string;
      phone?: string;
      address?: string;
      state?: string;
      lga?: string;
      admin_name?: string;
      admin_email?: string;
      admin_password?: string;
    }) {
      return request<{ message: string; tenant: any; admin_user?: any }>(
        '/auth/register/school',
        {
          method: 'POST',
          body: JSON.stringify({
            admin_name: payload.name + ' Administrator',
            admin_email: payload.email,
            admin_password: 'Password123!',
            ...payload,
          }),
        }
      );
    },

    async registerCompany(payload: {
      name: string;
      business_type: string;
      registration_number?: string;
      email: string;
      phone?: string;
      address?: string;
      admin_name?: string;
      admin_email?: string;
      admin_password?: string;
    }) {
      return request<{ message: string; company: any; admin_user?: any }>(
        '/auth/register/company',
        {
          method: 'POST',
          body: JSON.stringify({
            admin_name: payload.name + ' Verifier',
            admin_email: payload.email,
            admin_password: 'Password123!',
            ...payload,
          }),
        }
      );
    },

    async bootstrapSuperAdmin(payload: {
      name: string;
      email: string;
      password: string;
    }) {
      const res = await request<{ message: string; admin: any; token: string }>(
        '/auth/bootstrap-superadmin',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },

    async me() {
      return request<{ user: any; memberships: any[]; permissions: string[] }>('/me');
    },
  },

  // 2. Universal Verification
  verify: {
    async verify(query: string) {
      return request<any>('/verify', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    },

    async verifyById(id: string) {
      return request<any>(`/verify/${encodeURIComponent(id)}`);
    },
  },

  // 3. Credential Lifecycle
  credentials: {
    async list() {
      return request<any[]>('/credentials');
    },

    async get(id: string) {
      return request<any>(`/credentials/${id}`);
    },

    async create(payload: any) {
      return request<any>('/credentials', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async submit(id: string) {
      return request<any>(`/credentials/${id}/submit`, { method: 'POST' });
    },

    async approve(id: string) {
      return request<any>(`/credentials/${id}/approve`, { method: 'POST' });
    },

    async issue(id: string) {
      return request<any>(`/credentials/${id}/issue`, { method: 'POST' });
    },

    async revoke(id: string, reason: string) {
      return request<any>(`/credentials/${id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    async getEvents(id: string) {
      return request<any[]>(`/credentials/${id}/events`);
    },
  },

  // 4. Students
  students: {
    async list() {
      return request<any[]>('/students');
    },

    async create(payload: any) {
      return request<any>('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async archive(id: string) {
      return request<any>(`/students/${id}/archive`, { method: 'POST' });
    },
  },

  // 5. Courses
  courses: {
    async list() {
      return request<any[]>('/courses');
    },

    async create(payload: any) {
      return request<any>('/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // 6. Attendance
  attendance: {
    async list() {
      return request<any>('/attendance');
    },

    async record(payload: any) {
      return request<any>('/attendance', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: any) {
      return request<any>(`/attendance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    async export(payload: any) {
      return request<any>('/attendance/export', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // 7. Biometrics
  biometrics: {
    async devices() {
      return request<any[]>('/biometrics/devices');
    },

    async registerDevice(payload: any) {
      return request<any>('/biometrics/devices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async mappings() {
      return request<any[]>('/biometrics/mappings');
    },

    async createMapping(payload: any) {
      return request<any>('/biometrics/mappings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async ingestEvent(payload: any) {
      return request<any>('/biometrics/events/ingest', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // 8. Platform Admin
  admin: {
    async health() {
      return request<any>('/admin/health');
    },

    async applications() {
      return request<any[]>('/admin/applications');
    },

    async approveApplication(id: string) {
      return request<any>(`/admin/applications/${id}/approve`, { method: 'POST' });
    },

    async rejectApplication(id: string, reason?: string) {
      return request<any>(`/admin/applications/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    async suspendTenant(id: string, reason?: string) {
      return request<any>(`/admin/tenants/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    async reactivateTenant(id: string) {
      return request<any>(`/admin/tenants/${id}/reactivate`, { method: 'POST' });
    },

    async auditLogs() {
      return request<any[]>('/admin/audit-logs');
    },
  },
};
