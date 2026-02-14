import { Injectable } from '@angular/core';

const TOKEN_KEY = 'tv_token';
const ORG_ID_KEY = 'tv_org_id';
const ROLE_KEY = 'tv_role';

export type AppRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

@Injectable({ providedIn: 'root' })
export class AuthService {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setOrgId(orgId: string) {
    localStorage.setItem(ORG_ID_KEY, orgId);
  }

  getOrgId(): string | null {
    return localStorage.getItem(ORG_ID_KEY);
  }

  setRole(role: AppRole) {
    localStorage.setItem(ROLE_KEY, role);
  }

  getRole(): AppRole | null {
    const v = localStorage.getItem(ROLE_KEY);
    if (v === 'OWNER' || v === 'ADMIN' || v === 'MEMBER' || v === 'VIEWER')
      return v;
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ORG_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
}
