import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, AppRole } from '../core/auth.service';

const RANK: Record<AppRole, number> = {
  VIEWER: 1,
  USER: 2,
  ADMIN: 3,
  OWNER: 4,
  UNKNOWN: 0,
};

export function roleGuard(minRole: AppRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.getRole() ?? 'UNKNOWN';
    if ((RANK[role] ?? 0) >= (RANK[minRole] ?? 0)) return true;

    router.navigate(['/tasks']);
    return false;
  };
}
