import { inject, Injectable, signal } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import type { User } from '../../models/user/user';

interface TokenClaims {
  readonly sub: string;
  readonly unique_name: string;
  readonly email: string;
  readonly role: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly config = inject(APP_CONFIG);
  private readonly token = signal<string | null>(this.readToken());
  private readonly refreshToken = signal<string | null>(this.readRefresh());
  private readonly user = signal<User | null>(this.readUser());
  readonly tokenSignal = this.token.asReadonly();
  readonly userSignal = this.user.asReadonly();

  getToken(): string | null {
    return this.token();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  getUser(): User | null {
    return this.user();
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  save(token: string, user: User, refreshToken?: string): void {
    localStorage.setItem(this.config.tokenStorageKey, token);
    localStorage.setItem(this.config.userStorageKey, JSON.stringify(user));
    this.token.set(token);
    this.user.set(user);
    if (refreshToken) {
      localStorage.setItem(this.config.refreshTokenStorageKey, refreshToken);
      this.refreshToken.set(refreshToken);
    }
  }

  clear(): void {
    localStorage.removeItem(this.config.tokenStorageKey);
    localStorage.removeItem(this.config.refreshTokenStorageKey);
    localStorage.removeItem(this.config.userStorageKey);
    this.token.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
  }

  decode(token: string): TokenClaims | null {
    try {
      const [, payload] = token.split('.');
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as TokenClaims;
    } catch {
      return null;
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.config.tokenStorageKey, accessToken);
    localStorage.setItem(this.config.refreshTokenStorageKey, refreshToken);
    this.token.set(accessToken);
    this.refreshToken.set(refreshToken);
  }

  private readRefresh(): string | null {
    return typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(this.config.refreshTokenStorageKey);
  }

  private readToken(): string | null {
    return typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(this.config.tokenStorageKey);
  }

  private readUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.config.userStorageKey);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
