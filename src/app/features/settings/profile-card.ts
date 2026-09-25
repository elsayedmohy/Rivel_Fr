import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { apiErrorText } from '../../core/http/api-error.util';
import { ProfileService } from '../../core/http/profile.service';

@Component({
  selector: 'rl-profile-card',
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rl-card card">
      <h2>{{ 'settings.profile.title' | translate }}</h2>
      <p class="hint">{{ 'settings.profile.subtitle' | translate }}</p>

      @if (profile(); as p) {
        <p class="meta">{{ p.email }} · {{ roleKey() | translate }}</p>

        @if (!p.emailConfirmed) {
          <div class="rl-error">
            {{ 'settings.profile.emailUnconfirmed' | translate }}
            <button type="button" class="rl-link link" (click)="resend()" [disabled]="resent()">
              {{ (resent() ? 'settings.profile.confirmationSent' : 'settings.profile.resendConfirmation') | translate }}
            </button>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="save()" novalidate>
          <label class="rl-label" for="pf-name">{{ 'settings.profile.name' | translate }}</label>
          <div class="rl-control" [class.rl-control--invalid]="form.controls.name.touched && form.controls.name.invalid">
            <input id="pf-name" formControlName="name" maxlength="100" autocomplete="name" />
          </div>

          <label class="rl-label" for="pf-phone">{{ 'settings.profile.phone' | translate }}</label>
          <div class="rl-control" [class.rl-control--invalid]="form.controls.phoneNumber.touched && form.controls.phoneNumber.invalid">
            <input id="pf-phone" formControlName="phoneNumber" type="tel" dir="ltr" autocomplete="tel" />
          </div>
          <p class="hint">{{ 'settings.profile.phoneHint' | translate }}</p>

          @if (isCarrier()) {
            <label class="rl-label" for="pf-company">{{ 'settings.profile.company' | translate }}</label>
            <div class="rl-control" [class.rl-control--invalid]="form.controls.companyName.touched && form.controls.companyName.invalid">
              <input id="pf-company" formControlName="companyName" maxlength="200" />
            </div>

            <label class="rl-label" for="pf-bio">{{ 'settings.profile.bio' | translate }}</label>
            <textarea id="pf-bio" class="rl-control bio" formControlName="bio" maxlength="1000" rows="4"></textarea>
          }

          @if (error(); as e) {
            <p class="rl-error" role="alert">{{ e }}</p>
          }
          @if (saved()) {
            <p class="ok" role="status">{{ 'settings.profile.saved' | translate }}</p>
          }

          <button class="rl-btn rl-btn--primary submit" type="submit" [disabled]="saving()">
            {{ 'common.save' | translate }}
          </button>
        </form>
      }
    </section>
  `,
  styles: `
    .card { padding: var(--rl-s6, 24px); }
    h2 { margin: 0; font-size: 18px; }
    .hint { margin: 4px 0 0; font-size: 13px; color: var(--rl-ink-3); }
    .meta { margin: 12px 0; color: var(--rl-ink-2); }
    form { display: flex; flex-direction: column; margin-block-start: 16px; }
    .rl-label { margin-block-start: 14px; }
    .bio { height: auto; padding: 12px 14px; resize: vertical; font: inherit; color: var(--rl-ink); }
    .submit { align-self: flex-start; margin-block-start: 20px; }
    .ok { margin: 12px 0 0; color: var(--rl-ink-2); font-size: 13px; }
    .link { background: none; border: none; padding: 0; cursor: pointer; font: inherit; margin-inline-start: 8px; }
  `,
})
export class ProfileCard {
  private readonly service = inject(ProfileService);
  private readonly translate = inject(TranslateService);

  protected readonly profile = this.service.profile;
  protected readonly isCarrier = computed(() => this.profile()?.role === 'Carrier');
  protected readonly roleKey = computed(() =>
    this.isCarrier() ? 'auth.register.role.carrier' : 'auth.register.role.cargoOwner',
  );

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly resent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    phoneNumber: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\+?[0-9\s-]{7,20}$/)] }),
    companyName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
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
        ...(this.isCarrier() ? { companyName: v.companyName.trim(), bio: v.bio.trim() || null } : {}),
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
}
