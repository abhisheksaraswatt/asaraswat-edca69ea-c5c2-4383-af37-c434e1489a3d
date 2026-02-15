import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  template: `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;">
      <div style="width:520px; padding:24px; border:1px solid #eee; border-radius:12px; background:#fff;">
        <h2 style="margin:0 0 16px 0;">Login</h2>

        <div style="margin-bottom:10px;">
          <label>Email</label>
          <input
            style="width:100%; padding:10px; margin-top:6px;"
            [(ngModel)]="email"
            name="email"
            autocomplete="username"
          />
        </div>

        <div style="margin-bottom:14px;">
          <label>Password</label>
          <input
            style="width:100%; padding:10px; margin-top:6px;"
            [(ngModel)]="password"
            name="password"
            type="password"
            autocomplete="current-password"
          />
        </div>

        <button
          (click)="onLogin()"
          [disabled]="loading"
          style="padding:10px 14px; width:140px;"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <p *ngIf="error" style="color:#b00020; margin-top:12px;">{{ error }}</p>

        <p style="opacity:.7; margin-top:16px;">
          Tip: seed2@test.com / Passw0rd!
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = 'seed2@test.com';
  password = 'Passw0rd!';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.error = '';
    this.loading = true;

    this.auth
      .login(this.email, this.password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/tasks'),
        error: (e: any) => {
          this.error = e?.message ?? 'Login failed';
        },
      });
  }
}
