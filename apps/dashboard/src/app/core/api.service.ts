import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskCategory = 'WORK' | 'PERSONAL' | 'OTHER';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  category: TaskCategory;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

type ListTasksParams = {
  orgId: string;
  category?: TaskCategory;
  status?: TaskStatus;
};

type CreateTaskParams = {
  orgId: string;
  title: string;
  description?: string | null;
  category?: TaskCategory;
  status?: TaskStatus;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  // ✅ TasksComponent expects these to exist
  token: string | null = null;
  orgId: string | null = null;

  constructor(private http: HttpClient) {
    // restore from localStorage if present
    this.token = localStorage.getItem('accessToken');
    this.orgId = localStorage.getItem('orgId');
  }

  // ---------- auth helpers ----------
  private headers(): HttpHeaders {
    const t = this.token ?? localStorage.getItem('accessToken');
    if (!t) return new HttpHeaders({ 'Content-Type': 'application/json' });

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
    });
  }

  setSession(token: string, orgId?: string | null) {
    this.token = token;
    localStorage.setItem('accessToken', token);

    if (orgId !== undefined) {
      this.orgId = orgId;
      if (orgId) localStorage.setItem('orgId', orgId);
      else localStorage.removeItem('orgId');
    }
  }

  logout() {
    this.token = null;
    this.orgId = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('orgId');
    localStorage.removeItem('role');
  }

  // ---------- RBAC / role ----------
  // TasksComponent calls: await api.getMyRole(this.orgId)
  async getMyRole(orgId: string): Promise<'OWNER' | 'ADMIN' | 'VIEWER' | 'UNKNOWN'> {
    // Try a few likely endpoints — whichever exists in your backend
    const candidates = [
      `${this.baseUrl}/api/rbac/me`,
      `${this.baseUrl}/api/auth/me`,
      `${this.baseUrl}/api/me`,
      `${this.baseUrl}/api/rbac/context`,
    ];

    for (const url of candidates) {
      try {
        const resp: any = await firstValueFrom(this.http.get(url, { headers: this.headers() }));
        const role =
          resp?.['role'] ??
          resp?.['membership']?.['role'] ??
          resp?.['data']?.['role'] ??
          null;

        // optionally store role
        if (role) localStorage.setItem('role', role);

        return (role ?? 'UNKNOWN') as any;
      } catch {
        // try next
      }
    }

    return 'UNKNOWN';
  }

  // ---------- tasks ----------
  // TasksComponent calls: const res = await api.listTasks({orgId, category, status})
  async listTasks(params: ListTasksParams): Promise<Task[]> {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.status) qs.set('status', params.status);

    // Try common task endpoints
    const candidates = [
      // recommended REST
      `${this.baseUrl}/api/orgs/${params.orgId}/tasks?${qs.toString()}`,
      // some repos use /api/tasks?orgId=...
      `${this.baseUrl}/api/tasks?orgId=${encodeURIComponent(params.orgId)}&${qs.toString()}`,
      // or /api/org/{orgId}/tasks
      `${this.baseUrl}/api/org/${params.orgId}/tasks?${qs.toString()}`,
    ];

    let lastErr: any;

    for (const url of candidates) {
      try {
        const res: any = await firstValueFrom(this.http.get(url, { headers: this.headers() }));
        // allow either {items:[]} or [] responses
        return (res?.['items'] ?? res) as Task[];
      } catch (e) {
        lastErr = e;
      }
    }

    // Surface last error if needed
    throw lastErr ?? new Error('Failed to list tasks');
  }

  // TasksComponent calls: await api.createTask({orgId, title,...})
  async createTask(payload: CreateTaskParams): Promise<Task> {
    const body = {
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category ?? 'OTHER',
      status: payload.status ?? 'TODO',
    };

    const candidates = [
      `${this.baseUrl}/api/orgs/${payload.orgId}/tasks`,
      `${this.baseUrl}/api/org/${payload.orgId}/tasks`,
      `${this.baseUrl}/api/tasks`,
    ];

    let lastErr: any;

    for (const url of candidates) {
      try {
        const res: any = await firstValueFrom(
          this.http.post(url, body, { headers: this.headers() })
        );
        return res as Task;
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr ?? new Error('Failed to create task');
  }

  // optional helpers (if your tasks component uses them later)
  async updateTask(orgId: string, taskId: string, patch: Partial<Task>): Promise<Task> {
    const candidates = [
      `${this.baseUrl}/api/orgs/${orgId}/tasks/${taskId}`,
      `${this.baseUrl}/api/org/${orgId}/tasks/${taskId}`,
      `${this.baseUrl}/api/tasks/${taskId}`,
    ];

    let lastErr: any;

    for (const url of candidates) {
      try {
        const res: any = await firstValueFrom(
          this.http.patch(url, patch, { headers: this.headers() })
        );
        return res as Task;
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr ?? new Error('Failed to update task');
  }

  async deleteTask(orgId: string, taskId: string): Promise<void> {
    const candidates = [
      `${this.baseUrl}/api/orgs/${orgId}/tasks/${taskId}`,
      `${this.baseUrl}/api/org/${orgId}/tasks/${taskId}`,
      `${this.baseUrl}/api/tasks/${taskId}`,
    ];

    let lastErr: any;

    for (const url of candidates) {
      try {
        await firstValueFrom(this.http.delete(url, { headers: this.headers() }));
        return;
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr ?? new Error('Failed to delete task');
  }
}
