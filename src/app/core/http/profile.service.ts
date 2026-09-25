import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import type {
  CarrierPublicProfileDto,
  ChangePasswordDto,
  ProfileDto,
  UpdateProfileDto,
} from '../../models/profile/profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);
  private readonly tokens = inject(TokenService);

  readonly profile = signal<ProfileDto | null>(null);

  load(): void {
    this.refresh().subscribe({
      error: () => this.profile.set(null),
    });
  }

  refresh(): Observable<ProfileDto> {
    return this.api.get<ProfileDto>('profile/me').pipe(tap((p) => this.apply(p)));
  }

  update(payload: UpdateProfileDto): Observable<ProfileDto> {
    return this.api.put<ProfileDto>('profile/me', payload).pipe(tap((p) => this.apply(p)));
  }

  changePassword(payload: ChangePasswordDto): Observable<void> {
    return this.api.post<void>('profile/change-password', payload);
  }

  resendConfirmation(): Observable<void> {
    return this.api.post<void>('auth/resend-confirmation');
  }

  getCarrier(userId: string): Observable<CarrierPublicProfileDto> {
    return this.api.get<CarrierPublicProfileDto>(`carriers/${userId}`);
  }

  private apply(p: ProfileDto): void {
    this.profile.set(p);

    const token = this.tokens.getToken();
    const user = this.tokens.getUser();
    if (token && user) {
      this.tokens.save(token, {
        ...user,
        name: p.name,
        email: p.email,
        companyName: p.companyName ?? undefined,
      });
    }
  }
}
