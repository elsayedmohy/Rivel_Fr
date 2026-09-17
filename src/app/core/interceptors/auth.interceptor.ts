import type { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { TokenService } from '../http/token.service';

/**
 * Attaches `Authorization: Bearer <token>` to every API request when a
 * token is present. Phase 1 ships without auth screens; wiring happens in
 * Phase 2 alongside the login/register flows.
 */
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const token = inject(TokenService).getToken();

  if (!token) {
    return next(request);
  }

  const authenticated = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authenticated);
};