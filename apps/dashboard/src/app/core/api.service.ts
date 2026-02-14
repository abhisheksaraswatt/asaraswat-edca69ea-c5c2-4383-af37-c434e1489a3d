import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** ✅ Types expected by TasksComponent imports */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskCategory = 'WORK' | 'PERSONAL' | 'STUDY' | 'OTHER';

export interface Task {
  id: string;
  orgId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  category: TaskCategory;
  createdAt?: string;
  updatedAt?: string;
}

/** Auth payloads */
export type LoginResponse = {
  accessToken: string;
  orgId?: string;
  user?: any;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  // IMPORTANT:
  // backend base (no /api at end). We'll build endpoints explicitly below.
  private base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ✅ token stored for refresh persistence
  get token(): string | null {
    return localStorage.getItem('accessToken');
  }
  set token(value: string | null) {
    if (value) localStorage.setItem('accessToken', value);
    else localStorage.removeItem('accessToken');
  }

  // ✅ orgId stored for refresh persistence
  get orgId(): string | null {
    return localStorage.getItem('orgId');
  }
  set orgId(value: string | null) {
    if (value) localStorage.setItem('orgId', value);
    else localStorage.removeItem('orgId');
  }

  private authHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.token) headers = headers.set('Authorization', `Bearer ${this.token}`);
    return headers;
  }

  /** ✅ used by template (click)="api.logout()" */
  logout() {
    this.token = null;
    this.orgId = null;
  }

  /** ✅ used by LoginComponent */
  async login(email: string, password: string): Promise<LoginResponse> {
    const url = `${this.base}/api/auth/login`;

    const res = await firstValueFrom(
      this.http.post<LoginResponse>(url, { email, password }, { headers: this.authHeaders() })
    );

    if (!res?.accessToken) throw new Error('Login failed: missing accessToken');

    this.token = res.accessToken;

    // If backend returns orgId, store it; otherwise keep existing if present
    if (res.orgId) this.orgId = res.orgId;

    return res;
  }

  /** ✅ Resolve current user role for an org */
  async getMyRole(orgId: string): Promise<string> {
    // Common pattern: GET /api/rbac/my-role?orgId=...
    // If your backend is different, this is the ONLY place to change.
    const url = `${this.base}/api/rbac/my-role?orgId=${encodeURIComponent(orgId)}`;

    const res = await firstValueFrom(
      this.http.get<{ role?: string } | string>(url, { headers: this.authHeaders() })
    );

    if (typeof res === 'string') return res;
    return res?.role ?? 'UNKNOWN';
  }

  /** ✅ List tasks (TasksComponent passes an object) */
  async listTasks(params?: {
    orgId?: string;
    status?: TaskStatus;
    category?: TaskCategory;
    q?: string;
  }): Promise<Task[]> {
    const orgId = params?.orgId || this.orgId;
    if (!orgId) throw new Error('orgId is required to list tasks');

    const search = new URLSearchParams();
    search.set('orgId', orgId);
    if (params?.status) search.set('status', params.status);
    if (params?.category) search.set('category', params.category);
    if (params?.q) search.set('q', params.q);

    // ✅ Your API supports GET /orgs/:orgId/tasks (controller you showed)
    // That route does NOT include /api prefix.
    const url = `${this.base}/orgs/${orgId}/tasks?${search.toString()}`;

    const res = await firstValueFrom(
      this.http.get<Task[]>(url, { headers: this.authHeaders() })
    );

    return res ?? [];
  }

  /** ✅ Create task (TasksComponent calls createTask(payload) with ONE arg) */
  async createTask(payload: {
    title: string;
    description?: string;
    category?: TaskCategory;
    status?: TaskStatus;
    orgId?: string;
  }): Promise<Task> {
    const orgId = payload.orgId || this.orgId;
    if (!orgId) throw new Error('orgId is required to create task');

    // ✅ Your alias controller is @Controller('api/tasks') and has @Post()
    // So the POST route is: POST /api/tasks?orgId=...
    const url = `${this.base}/api/tasks?orgId=${encodeURIComponent(orgId)}`;

    const res = await firstValueFrom(
      this.http.post<Task>(
        url,
        {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          status: payload.status,
        },
        { headers: this.authHeaders() }
      )
    );

    if (!res?.id) throw new Error('Create task failed');
    return res;
  }

  /** ✅ Update task (TasksComponent calls updateTask(orgId, id, payload)) */
  async updateTask(orgId: string, id: string, payload: Partial<Omit<Task, 'id'>>): Promise<Task> {
    if (!orgId) throw new Error('orgId is required to update task');

    // ✅ Alias controller uses PUT /api/tasks/:id?orgId=...
    const url = `${this.base}/api/tasks/${encodeURIComponent(id)}?orgId=${encodeURIComponent(orgId)}`;

    const res = await firstValueFrom(
      this.http.put<Task>(url, payload, { headers: this.authHeaders() })
    );

    if (!res?.id) throw new Error('Update task failed');
    return res;
  }

  /** ✅ Delete task (TasksComponent calls deleteTask(orgId, id)) */
  async deleteTask(orgId: string, id: string): Promise<void> {
    if (!orgId) throw new Error('orgId is required to delete task');

    const url = `${this.base}/api/tasks/${encodeURIComponent(id)}?orgId=${encodeURIComponent(orgId)}`;

    await firstValueFrom(
      this.http.delete(url, { headers: this.authHeaders() })
    );
  }
}
