import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { apiErrorText } from '../../../core/http/api-error.util';
import { ProfileService } from '../../../core/http/profile.service';
import { NgOptimizedImage } from '@angular/common';
import { TuiButton } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { PHONE_PATTERN } from '../../../models/enums';

@Component({
  selector: 'rl-profile-card',
  imports: [ReactiveFormsModule, TranslatePipe, NgOptimizedImage, TuiButton, TuiAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'profile-card.html',
  styleUrls: ['profile-card.scss'],
})
export class ProfileCard {
  private readonly service = inject(ProfileService);
  private readonly translate = inject(TranslateService);

  protected readonly profile = this.service.profile;
  protected readonly isCarrier = computed(() => this.profile()?.role === 'Carrier');
  protected readonly roleKey = computed(() =>
    this.isCarrier() ? 'auth.register.role.carrier' : 'auth.register.role.cargoOwner',
  );
  protected readonly logoBusy = signal(false);
  protected readonly logoError = signal<string | null>(null);

  private static readonly LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  private static readonly LOGO_MAX = 2 * 1024 * 1024;
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly resent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(PHONE_PATTERN)],
    }),
    companyName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    bio: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
  });

  constructor() {
    this.service.load();
    effect(() => {
      const p = this.profile();
      if (p && !this.form.dirty) {
        this.form.reset({
          name: p.name,
          phoneNumber: p.phoneNumber ?? '',
          companyName: p.companyName ?? '',
          bio: p.bio ?? '',
        });
      }
    });
    effect(() => {
      const company = this.form.controls.companyName;
      if (this.isCarrier()) {
        company.addValidators(Validators.required);
      } else {
        company.removeValidators(Validators.required);
      }
      company.updateValueAndValidity();
    });
  }

  protected save(): void {
    this.form.markAllAsTouched();
    this.saved.set(false);
    this.error.set(null);
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.service
      .update({
        name: v.name.trim(),
        phoneNumber: v.phoneNumber.trim() || null,
        ...(this.isCarrier()
          ? { companyName: v.companyName.trim(), bio: v.bio.trim() || null }
          : {}),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
          this.form.markAsPristine();
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.error.set(apiErrorText(err, this.translate));
        },
      });
  }

  protected resend(): void {
    this.service.resendConfirmation().subscribe({
      next: () => this.resent.set(true),
      error: (err: unknown) => this.error.set(apiErrorText(err, this.translate)),
    });
  }

  protected onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!ProfileCard.LOGO_TYPES.includes(file.type)) {
      this.logoError.set(this.translate.instant('errors.logo.invalid_type'));
      return;
    }
    if (file.size > ProfileCard.LOGO_MAX) {
      this.logoError.set(this.translate.instant('errors.logo.too_large'));
      return;
    }

    this.logoBusy.set(true);
    this.logoError.set(null);
    this.service.uploadLogo(file).subscribe({
      next: () => this.logoBusy.set(false),
      error: (err: unknown) => {
        this.logoBusy.set(false);
        this.logoError.set(apiErrorText(err, this.translate));
      },
    });
  }

  protected removeLogo(): void {
    this.logoBusy.set(true);
    this.logoError.set(null);
    this.service.removeLogo().subscribe({
      next: () => this.logoBusy.set(false),
      error: (err: unknown) => {
        this.logoBusy.set(false);
        this.logoError.set(apiErrorText(err, this.translate));
      },
    });
  }
}
