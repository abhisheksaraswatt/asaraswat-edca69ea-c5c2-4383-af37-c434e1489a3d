import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { authGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { AuditLogComponent } from './pages/audit-log/audit-log.component';
import { roleGuard } from './guards/role.guard';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px">
      <h2>✅ Logged in</h2>
      <p>You are now authenticated. Token saved in localStorage.</p>
    </div>
  `,
})
export class HomeComponent {}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },

  { path: 'login', component: LoginComponent },

  { path: 'home', component: HomeComponent, canActivate: [authGuard] },

  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },

  // only OWNER/ADMIN can view audit log
  {
    path: 'audit-log',
    component: AuditLogComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['OWNER', 'ADMIN'] },
  },

  { path: '**', redirectTo: 'tasks' },
];
