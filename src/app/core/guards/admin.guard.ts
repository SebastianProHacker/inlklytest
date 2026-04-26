import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getCurrentUserRole();
  const normalized = role?.toLowerCase();
  if (normalized !== 'admin' && normalized !== 'administrator') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
