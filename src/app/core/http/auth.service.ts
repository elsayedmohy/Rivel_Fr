import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { ProfileService } from './profile.service';
import { TokenService } from './token.service';
import { APP_CONFIG } from '../config/app-config';
import { toApiErrorResponse, toApiErrorResponseFromIdentity } from './api-error.util';
import type {
  AuthResponseDto,
  AuthResultDto,
  ConfirmEmailDto,
  CredentialsDto,
  RegisterDto,
  ResetPasswordDto,
} from '../../models/auth/auth';
import type { UserRole } from '../../models/enums';
import type { User } from '../../models/user/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly profile = inject(ProfileService);
  private readonly config = inject(APP_CONFIG);

  login(credentials: CredentialsDto): Observable<AuthResponseDto> {
    return this.api.post<AuthResultDto>('auth/login', credentials).pipe(
      switchMap((result) =>
        result.response
          ? this.persist(result.response, credentials.email)
          : throwError(() =>
              toApiErrorResponseFromIdentity(
                result.errors.map(({ code, description }) => ({ field: code, message: description })),
              ),
            ),
      ),
      catchError((error: unknown) => throwError(() => toApiErrorResponse(error))),
    );
  }

  register(payload: RegisterDto): Observable<AuthResponseDto> {
    return this.api.post<AuthResultDto>('auth/register', payload).pipe(
      switchMap((result) =>
        result.response
          ? this.persist(result.response, payload.email, payload.name)
          : throwError(() =>
              toApiErrorResponseFromIdentity(
                result.errors.map(({ code, description }) => ({ field: code, message: description })),
              ),
            ),
      ),
      catchError((error: unknown) => throwError(() => toApiErrorResponse(error))),
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.api.post<void>('auth/forgot-password', { email });
  }

  resetPassword(payload: ResetPasswordDto): Observable<void> {
    return this.api.post<void>('auth/reset-password', payload);
  }

  confirmEmail(payload: ConfirmEmailDto): Observable<void> {
    return this.api.post<void>('auth/confirm-email', payload);
  }

  logout(): void {
    this.tokenService.clear();
    this.profile.profile.set(null);
    this.forgetLegacyKnownUsers();
  }

  private persist(
    response: AuthResponseDto,
    email: string,
    initialName = '',
  ): Observable<AuthResponseDto> {
    const user: User = {
      id: response.userId,
      name: initialName,
      email,
      role: toUserRole(response.role),
    };

    this.tokenService.save(response.token, user,response.refreshToken);
    this.forgetLegacyKnownUsers();
    return of(response);
  }

  private forgetLegacyKnownUsers(): void {
    try {
      localStorage.removeItem(this.config.knownUsersKey);
    } catch {
    }
  }
}

function toUserRole(role: string): UserRole {
  return role === 'Carrier' ? 'Carrier' : 'CargoOwner';
}
