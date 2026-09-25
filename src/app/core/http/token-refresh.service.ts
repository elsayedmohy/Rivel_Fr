import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, shareReplay } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { TokenService } from './token.service';
import type { TokensResponseDto } from '../../models/auth/auth';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly config = inject(APP_CONFIG);
  private inFlight$: Observable<string> | null = null;

  refresh(): Observable<string> {
    this.inFlight$ ??= this.http
      .post<TokensResponseDto>(`${this.config.apiBaseUrl}/auth/refresh`, {
        refreshToken: this.tokens.getRefreshToken(),
      })
      .pipe(
        map((res) => {
          this.tokens.setTokens(res.accessToken, res.refreshToken);
          return res.accessToken;
        }),
        finalize(() => (this.inFlight$ = null)),
        shareReplay(1),
      );

    return this.inFlight$;
  }
}
