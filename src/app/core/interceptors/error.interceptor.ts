import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../http/token.service';
import { TokenRefreshService } from '../http/token-refresh.service';

const NO_REFRESH = ['auth/login', 'auth/register', 'auth/refresh'];

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const tokens = inject(TokenService);
  const refresher = inject(TokenRefreshService);

  const logout = () => {
    tokens.clear();
    void router.navigate(['/auth/login']);
  };

  return next(request).pipe(
    catchError((error: unknown) => {
      const is401 = error instanceof HttpErrorResponse && error.status === 401;
      if (!is401 || NO_REFRESH.some((path) => request.url.endsWith(path))) {
        return throwError(() => error);
      }

      if (!tokens.getRefreshToken()) {
        logout();
        return throwError(() => error);
      }

      return refresher.refresh().pipe(
        catchError((refreshError: unknown) => {
          logout();
          return throwError(() => refreshError);
        }),
        switchMap((accessToken) =>
          next(request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })),
        ),
      );
    }),
  );
};
