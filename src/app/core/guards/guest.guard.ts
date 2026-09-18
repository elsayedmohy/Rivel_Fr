import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../http/token.service';

/**
 * Blocks the login/register screens for users who already hold a session and
 * sends them straight to the app.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
