import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService, AppRole } from '../../core/auth.service';
import { friendlyHttpError } from '../../utils/http-error';

type AuditLogItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  before?: any;
  after?: any;
  createdAt: string;
  actorUserId?: string;
  org?: { id: string; name: string };
};

@Component({
  standalone: true,
  selector: 'app-audit-log',
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="top">
          <div>
            <h2>Audit Log</h2>
            <div class="sub">Visible to OWNER and ADMIN only</div>
          </div>
          <div class="actions">
            <button class="btn" (click)="back()">Back</button>
            <button class="btn" (click)="logout()">Logout</button>
          </div>
        </div>

        <p class="error" *ngIf="error">{{ error }}</p>

        <div *ngIf="logs.length; else empty" class="list">
          <div class="row" *ngFor="let l of logs">
            <div class="line">
              <b>{{ l.action }}</b> — {{ l.entity }} ({{ l.entityId }})
            </div>
            <div class="muted">
              {{ l.createdAt }}
              <span *ngIf="l.org">
                • Org: {{ l.org.name }} ({{ l.org.id }})</span
              >
            </div>

            <details *ngIf="l.before || l.after" style="margin-top:8px;">
              <summary>View before/after</summary>
              <pre>{{ l.before | json }}</pre>
              <pre>{{ l.after | json }}</pre>
            </details>
          </div>
        </div>

        <ng-template #empty>
          <div class="empty">No audit logs yet.</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: #f5f7fb;
        padding: 28px;
        display: flex;
        justify-content: center;
      }
      .card {
        width: min(980px, 100%);
        background: #fff;
        border: 1px solid #e6eaf2;
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 10px 30px rgba(12, 20, 33, 0.08);
      }
      .top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      h2 {
        margin: 0;
        font-size: 28px;
      }
      .sub {
        margin-top: 6px;
        color: #6b768c;
        font-size: 13px;
      }
      .actions {
        display: flex;
        gap: 10px;
      }
      .btn {
        padding: 11px 16px;
        border-radius: 10px;
        border: 1px solid #d6deee;
        background: #fff;
        cursor: pointer;
      }
      .error {
        margin-top: 12px;
        color: #b00020;
      }
      .list {
        margin-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .row {
        border: 1px solid #eef2fb;
        border-radius: 14px;
        padding: 14px;
        background: #fff;
      }
      .line {
        color: #1f2a44;
      }
      .muted {
        margin-top: 4px;
        color: #6b768c;
        font-size: 12px;
      }
      .empty {
        margin-top: 18px;
        border: 1px dashed #d6deee;
        border-radius: 14px;
        padding: 18px;
        color: #5d6a84;
      }
      pre {
        background: #f5f7fb;
        border: 1px solid #e6eaf2;
        border-radius: 10px;
        padding: 10px;
        overflow: auto;
      }
    `,
  ],
})
export class AuditLogComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  orgId = this.auth.getOrgId() || '';
  role: AppRole = this.auth.getRole() || 'VIEWER';

  logs: AuditLogItem[] = [];
  error = '';

  private headers() {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }

  async ngOnInit() {
    // RBAC: block at UI level
    if (!(this.role === 'OWNER' || this.role === 'ADMIN')) {
      await this.router.navigateByUrl('/tasks');
      return;
    }
    await this.load();
  }

  private async load() {
    this.error = '';
    try {
      // If your backend expects orgId query param, keep it consistent:
      const url = `${environment.apiBaseUrl}/audit-log?orgId=${this.orgId}`;
      this.logs = await firstValueFrom(
        this.http.get<AuditLogItem[]>(url, { headers: this.headers() }),
      );
    } catch (e: any) {
      this.error = friendlyHttpError(e);
    }
  }

  back() {
    this.router.navigateByUrl('/tasks');
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
