import type { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { TokenService } from '../http/token.service';

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
