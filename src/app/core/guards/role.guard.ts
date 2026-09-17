import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../http/token.service';
import type { UserRole } from '../../models/enums';

/**
 * Restricts a route to one or more roles. Unauthenticated users are sent to
 * the login screen; the wrong role falls back to the dashboard.
 */
export function roleGuard(...allowed: UserRole[]): CanActivateFn {
  return () => {
    const tokenService = inject(TokenService);
    const router = inject(Router);
    const user = tokenService.getUser();

    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }

    if (allowed.includes(user.role)) {
      return true;
    }

    return router.createUrlTree(['/app/dashboard']);
  };
}