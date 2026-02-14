import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  session() {
    // your backend may not have this; if not, just remove session() usage and set orgId/role from existing logic
    return this.http.get<any>('/api/auth/session');
  }

  getTasks(params: any) {
    return this.http.get<any[]>('/api/tasks', { params });
  }

  createTask(body: any) {
    const { orgId, ...payload } = body;
    return this.http.post('/api/tasks', payload, { params: { orgId } });
  }

  updateTask(body: any) {
    const { orgId, id, ...payload } = body;
    return this.http.put(`/api/tasks/${id}`, payload, { params: { orgId } });
  }

  deleteTask(body: any) {
    const { orgId, id } = body;
    return this.http.delete(`/api/tasks/${id}`, { params: { orgId } });
  }

  logout() {
    localStorage.removeItem('accessToken');
    location.href = '/login';
  }
}
