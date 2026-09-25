import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TuiButton, TuiInput } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { apiErrorText } from '../../../core/http/api-error.util';
import { AuthService } from '../../../core/http/auth.service';
import { strongPassword } from '../password.validator';

@Component({
  selector: 'rl-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiButtonLoading, TuiInput, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../login/login-page.scss',
  template: `
    <main class="page">
      <section class="card">
        <div class="headings">
          <h2>{{ 'auth.reset.title' | translate }}</h2>
          <p>{{ 'auth.register.passwordHint' | translate }}</p>
        </div>

        @if (done()) {
          <p role="status">{{ 'auth.reset.done' | translate }}</p>
          <p class="switch"><a routerLink="/auth/login">{{ 'auth.forgot.backToLogin' | translate }}</a></p>
        } @else if (!link) {
          <div class="error-box" role="alert"><p>{{ 'auth.reset.badLink' | translate }}</p></div>
        } @else {
          <form (ngSubmit)="submit()" novalidate class="form">
            @if (error(); as e) {
              <div class="error-box" role="alert"><p>{{ e }}</p></div>
            }
            <tui-textfield tuiTextfieldSize="l" [invalid]="password.touched && password.invalid">
              <label tuiLabel>{{ 'settings.password.new' | translate }}</label>
              <input tuiInput type="password" [formControl]="password" autocomplete="new-password" />
            </tui-textfield>
            @if (password.touched && password.invalid) {
              <p class="error-box">{{ 'auth.validation.strongPassword' | translate }}</p>
            }
            <button tuiButton type="submit" appearance="primary" size="l" class="submit" [loading]="submitting()">
              {{ 'auth.reset.submit' | translate }}
            </button>
          </form>
        }
      </section>
    </main>
  `,
})
export class ResetPasswordPage {
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly link = this.params.get('email') && this.params.get('token')
    ? { email: this.params.get('email')!, token: this.params.get('token')! }
    : null;

  protected readonly password = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, strongPassword],
  });
  protected readonly submitting = signal(false);
  protected readonly done = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    this.password.markAsTouched();
    if (this.password.invalid || !this.link) return;

    this.submitting.set(true);
    this.error.set(null);
    this.auth.resetPassword({ ...this.link, newPassword: this.password.value }).subscribe({
      next: () => this.done.set(true),
      error: (err: unknown) => {
        this.submitting.set(false);
        this.error.set(apiErrorText(err, this.translate));
      },
    });
  }
}
