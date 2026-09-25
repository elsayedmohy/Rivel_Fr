import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { apiErrorText } from '../../core/http/api-error.util';
import { ProfileService } from '../../core/http/profile.service';
import { strongPassword } from '../auth/password.validator';

@Component({
  selector: 'rl-password-card',
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rl-card card">
      <h2>{{ 'settings.password.title' | translate }}</h2>
      <p class="hint">{{ 'auth.register.passwordHint' | translate }}</p>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <label class="rl-label" for="pw-current">{{ 'settings.password.current' | translate }}</label>
        <div class="rl-control" [class.rl-control--invalid]="bad('currentPassword')">
          <input id="pw-current" type="password" formControlName="currentPassword" autocomplete="current-password" />
        </div>

        <label class="rl-label" for="pw-new">{{ 'settings.password.new' | translate }}</label>
        <div class="rl-control" [class.rl-control--invalid]="bad('newPassword')">
          <input id="pw-new" type="password" formControlName="newPassword" autocomplete="new-password" />
        </div>
        @if (bad('newPassword')) {
          <p class="hint invalid">{{ 'auth.validation.strongPassword' | translate }}</p>
        }

        @if (error(); as e) {
          <p class="rl-error" role="alert">{{ e }}</p>
        }
        @if (saved()) {
          <p class="ok" role="status">{{ 'settings.password.saved' | translate }}</p>
        }

        <button class="rl-btn rl-btn--primary submit" type="submit" [disabled]="saving()">
          {{ 'settings.password.submit' | translate }}
        </button>
      </form>
    </section>
  `,
  styles: `
    .card { padding: var(--rl-s6, 24px); }
    h2 { margin: 0; font-size: 18px; }
    .hint { margin: 4px 0 0; font-size: 13px; color: var(--rl-ink-3); }
    .invalid { color: var(--rl-danger); }
    form { display: flex; flex-direction: column; margin-block-start: 16px; }
    .rl-label { margin-block-start: 14px; }
    .submit { align-self: flex-start; margin-block-start: 20px; }
    .ok { margin: 12px 0 0; color: var(--rl-ink-2); font-size: 13px; }
  `,
})
export class PasswordCard {
  private readonly service = inject(ProfileService);
  private readonly translate = inject(TranslateService);

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, strongPassword] }),
  });

  protected bad(key: 'currentPassword' | 'newPassword'): boolean {
    const c = this.form.controls[key];
    return c.touched && c.invalid;
  }

  protected save(): void {
    this.form.markAllAsTouched();
    this.saved.set(false);
    this.error.set(null);
    if (this.form.invalid) return;

    this.saving.set(true);
    this.service.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.form.reset();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(apiErrorText(err, this.translate));
      },
    });
  }
}
