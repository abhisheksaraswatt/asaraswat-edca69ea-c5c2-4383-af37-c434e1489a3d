import { Injectable } from '@angular/core';

export type AppRole = 'OWNER' | 'ADMIN' | 'USER' | 'VIEWER' | 'UNKNOWN';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private TOKEN_KEY = 'accessToken';
  private ORG_KEY = 'orgId';
  private ROLE_KEY = 'role';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getOrgId(): string | null {
    return localStorage.getItem(this.ORG_KEY);
  }

  getRole(): AppRole {
    return (localStorage.getItem(this.ROLE_KEY) as AppRole) ?? 'UNKNOWN';
  }

  setOrgRole(orgId: string | null, role: AppRole) {
    if (orgId) localStorage.setItem(this.ORG_KEY, orgId);
    else localStorage.removeItem(this.ORG_KEY);

    localStorage.setItem(this.ROLE_KEY, role ?? 'UNKNOWN');
  }

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ORG_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  // ✅ tolerant extractor for many backend shapes
  extractOrgRole(resp: any): { orgId: string | null; role: AppRole | null } {
    const r = resp as any;

    // direct shape: { orgId, role }
    if (r?.['orgId'] || r?.['role']) {
      return { orgId: r?.['orgId'] ?? null, role: (r?.['role'] ?? null) as AppRole | null };
    }

    // membership shape: { membership: { orgId, role, org: { id } } }
    if (r?.['membership']) {
      const m = r['membership'];
      return {
        orgId: m?.['orgId'] ?? m?.['org']?.['id'] ?? null,
        role: (m?.['role'] ?? null) as AppRole | null,
      };
    }

    // org shape: { org: { id }, role }
    if (r?.['org']) {
      return { orgId: r?.['org']?.['id'] ?? null, role: (r?.['role'] ?? null) as AppRole | null };
    }

    return { orgId: null, role: null };
  }
}
