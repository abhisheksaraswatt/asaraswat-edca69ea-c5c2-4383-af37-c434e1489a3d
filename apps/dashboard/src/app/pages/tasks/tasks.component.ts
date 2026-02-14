import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService, Task, TaskCategory, TaskStatus } from '../../core/api.service';

@Component({
  standalone: true,
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
})
export class TasksComponent {
  orgId: string | null = null;
  role: string = 'UNKNOWN';

  // create
  title = '';
  description = '';
  category: TaskCategory | '' = '';

  // filters
  categoryFilter: TaskCategory | '' = '';
  statusFilter: TaskStatus | '' = '';
  sort: 'NEWEST' | 'OLDEST' = 'NEWEST';

  tasks: Task[] = [];
  loading = false;
  error = '';

  constructor(public api: ApiService, private router: Router) {}

  async ngOnInit() {
    this.orgId = this.api.orgId;

    if (!this.api.token) {
      await this.router.navigateByUrl('/login');
      return;
    }

    if (!this.orgId) {
      this.error = 'orgId missing. Login again.';
      return;
    }

    // role (optional - if endpoint exists)
    this.role = await this.api.getMyRole(this.orgId);

    await this.loadTasks();
  }

  get canWrite() {
    return this.role === 'OWNER' || this.role === 'ADMIN';
  }

  async loadTasks() {
    if (!this.orgId) return;

    this.loading = true;
    this.error = '';
    try {
      const res = await this.api.listTasks({
        orgId: this.orgId,
        category: this.categoryFilter || undefined,
        status: this.statusFilter || undefined,
      });

      this.tasks = res;

      if (this.sort === 'NEWEST') {
        this.tasks = [...this.tasks].reverse();
      }
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to load tasks';
      this.tasks = [];
    } finally {
      this.loading = false;
    }
  }

  async create() {
    if (!this.orgId) return;
    if (!this.canWrite) return;

    await this.api.createTask({
      orgId: this.orgId,
      title: this.title.trim(),
      description: this.description.trim(),
      category: (this.category || 'WORK') as TaskCategory,
      status: 'TODO',
    });

    this.title = '';
    this.description = '';
    this.category = '';

    await this.loadTasks();
  }

  async markDone(t: Task) {
    if (!this.orgId || !this.canWrite) return;
    await this.api.updateTask(this.orgId, t.id, { status: 'DONE' });
    await this.loadTasks();
  }

  async remove(t: Task) {
    if (!this.orgId || !this.canWrite) return;
    await this.api.deleteTask(this.orgId, t.id);
    await this.loadTasks();
  }

  doLogout() {
    this.api.logout();
    this.router.navigateByUrl('/login');
  }
}
