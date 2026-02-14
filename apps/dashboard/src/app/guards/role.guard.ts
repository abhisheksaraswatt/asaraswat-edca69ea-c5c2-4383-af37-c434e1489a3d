import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AppRole } from '../services/auth.service';

export const roleGuard =
  (allowed: AppRole[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.getRole();
    if (!role || !allowed.includes(role)) {
      router.navigateByUrl('/tasks');
      return false;
    }
    return true;
  };
