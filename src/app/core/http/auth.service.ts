import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { APP_CONFIG } from '../config/app-config';
import { toApiErrorResponse, toApiErrorResponseFromIdentity } from './api-error.util';
import type { AuthResultDto, CredentialsDto, RegisterDto } from '../../models/auth/auth';
import type { UserRole } from '../../models/enums';
import type { User } from '../../models/user/user';

type KnownUsers = Record<string, string>;

/**
 * Login / register against the real backend and keeps the local session in
 * sync with TokenService.
 *
 * The backend returns no display name on login (nor via `/me`), so names are
 * remembered locally (keyed by lower-cased email) at registration time and
 * replayed on later logins — otherwise the UI falls back to the e-mail.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly config = inject(APP_CONFIG);

  login(credentials: CredentialsDto): Observable<void> {
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

  register(payload: RegisterDto): Observable<void> {
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

  logout(): void {
    this.tokenService.clear();
  }

  private persist(
    response: AuthResultDto['response'],
    email: string,
    newName?: string,
  ): Observable<void> {
    if (!response) {
      return EMPTY;
    }

    this.rememberUser(email, newName);

    const name = this.knownName(email) ?? newName ?? '';
    const user: User = {
      id: response.userId,
      name,
      email,
      role: toUserRole(response.role),
    };

    this.tokenService.save(response.token, user);
    return EMPTY;
  }

  private rememberUser(email: string, name?: string): void {
    if (!name) {
      return;
    }
    const users = this.readKnownUsers();
    users[normalizeEmail(email)] = name;
    localStorage.setItem(this.config.knownUsersKey, JSON.stringify(users));
  }

  private knownName(email: string): string | null {
    return this.readKnownUsers()[normalizeEmail(email)] ?? null;
  }

  private readKnownUsers(): KnownUsers {
    try {
      const raw = localStorage.getItem(this.config.knownUsersKey);
      return raw ? (JSON.parse(raw) as KnownUsers) : {};
    } catch {
      return {};
    }
  }
}

function toUserRole(role: string): UserRole {
  return role === 'Carrier' ? 'Carrier' : 'CargoOwner';
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}