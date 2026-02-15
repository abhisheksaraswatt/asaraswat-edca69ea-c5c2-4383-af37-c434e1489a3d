import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, catchError, map } from 'rxjs';
import { SessionService, AppRole } from './session.service';

type LoginResp = {
  accessToken?: string;
  token?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private session: SessionService) {}

  getToken(): string | null {
    return this.session.getToken();
  }

  getOrgId(): string | null {
    return this.session.getOrgId();
  }

  getRole(): AppRole {
    return this.session.getRole();
  }

  isLoggedIn(): boolean {
    return !!this.session.getToken();
  }

  logout() {
    this.session.clear();
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResp>(`${this.API}/auth/login`, { email, password })
      .pipe(
        switchMap((resp) => {
          const token = resp?.accessToken ?? resp?.token;
          if (!token) throw new Error('No token returned from login');

          this.session.setToken(token);

          return this.http.get<any>(`${this.API}/rbac/me`).pipe(
            map((me) => {
              const extracted = this.session.extractOrgRole(me);
              this.session.setOrgRole(extracted.orgId, extracted.role ?? 'UNKNOWN');
            }),
            catchError(() => {
              this.session.setOrgRole(null, 'UNKNOWN');
              return of(void 0);
            })
          );
        }),
        map(() => void 0)
      );
  }
}
