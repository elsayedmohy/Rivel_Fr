import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TuiButton, TuiInput } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { apiErrorText } from '../../../core/http/api-error.util';
import { AuthService } from '../../../core/http/auth.service';

@Component({
  selector: 'rl-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, TuiButton, TuiButtonLoading, TuiInput, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../login/login-page.scss',
  template: `
    <main class="page">
      <section class="card">
        <div class="headings">
          <h2>{{ 'auth.forgot.title' | translate }}</h2>
          <p>{{ 'auth.forgot.subtitle' | translate }}</p>
        </div>

        @if (sent()) {
          <p role="status">{{ 'auth.forgot.sent' | translate }}</p>
        } @else {
          <form (ngSubmit)="submit()" novalidate class="form">
            @if (error(); as e) {
              <div class="error-box" role="alert"><p>{{ e }}</p></div>
            }
            <tui-textfield tuiTextfieldSize="l" [invalid]="email.touched && email.invalid">
              <label tuiLabel>{{ 'auth.login.email' | translate }}</label>
              <input tuiInput type="email" [formControl]="email" autocomplete="email" />
            </tui-textfield>
            <button tuiButton type="submit" appearance="primary" size="l" class="submit" [loading]="submitting()">
              {{ 'auth.forgot.submit' | translate }}
            </button>
          </form>
        }

        <p class="switch"><a routerLink="/auth/login">{{ 'auth.forgot.backToLogin' | translate }}</a></p>
      </section>
    </main>
  `,
})
export class ForgotPasswordPage {
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected submit(): void {
    this.email.markAsTouched();
    if (this.email.invalid) return;

    this.submitting.set(true);
    this.error.set(null);
    this.auth.forgotPassword(this.email.value.trim()).subscribe({
      next: () => this.sent.set(true),
      error: (err: unknown) => {
        this.submitting.set(false);
        this.error.set(apiErrorText(err, this.translate));
      },
    });
  }
}
