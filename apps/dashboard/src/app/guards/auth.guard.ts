import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  // If logged in → allow
  if (token) {
    return true;
  }

  // If not logged in → redirect to login
  router.navigateByUrl('/login');
  return false;
};
