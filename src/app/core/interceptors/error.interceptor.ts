import type {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../http/token.service';

/**
 * Maps backend error shapes to a single message:
 * - 400 validation errors (`errors: Record<string, string[]>`)
 * - business errors (plain-text body)
 * - 401 → clear the session and redirect to login
 *
 * Data services consume errors through the shared ApiService, so this
 * interceptor only logs and handles the global 401 case for now.
 */
export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return next(request).pipe(
    tap({
      error: (error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status === 401) {
          tokenService.clear();
          void router.navigate(['/auth/login']);
        }
      },
    }),
  );
};