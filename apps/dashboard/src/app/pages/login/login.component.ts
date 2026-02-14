import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = null;

    const payload = {
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.http
      .post<LoginResponse>('/auth/login', payload) // ✅ proxy -> http://localhost:3000/auth/login
      .pipe(finalize(() => (this.loading = false))) // ✅ ALWAYS stops spinner
      .subscribe({
        next: async (res) => {
          // ✅ token exists exactly as "accessToken"
          if (!res?.accessToken) {
            this.error = 'Login succeeded but accessToken missing.';
            return;
          }

          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('user', JSON.stringify(res.user));

          // ✅ navigate; fallback route if "/" not configured
          try {
            await this.router.navigateByUrl('/');
          } catch {
            await this.router.navigateByUrl('/tasks');
          }
        },
        error: (err) => {
          this.error = err?.error?.message || 'Invalid email or password';
        },
      });
  }
}
