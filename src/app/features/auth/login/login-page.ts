import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiError,
  TuiIcon,
  TuiInput,
  TuiTextfieldContent,
} from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/http/auth.service';
import type { ApiErrorResponse } from '../../../models/api/api-error';

@Component({
  selector: 'rl-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiIcon,
    TuiInput,
    TuiTextfieldContent,
    TranslatePipe,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly serverErrors = signal<ApiErrorResponse | null>(null);
  readonly passwordIcon = computed(() => (this.showPassword() ? '@tui.eye-off' : '@tui.eye'));

  fieldError(key: 'email' | 'password'): string | null {
    return this.validationMessage(this.form.controls[key]);
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  submit(): void {
    this.serverErrors.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard'])
      },
      error: (error: ApiErrorResponse) => {
        this.submitting.set(false);
        this.serverErrors.set(error);
      },
    });
  }

  private validationMessage(control: {touched:boolean, invalid: boolean; errors: Record<string, unknown> | null }): string | null {
    if (control.touched &&  control.invalid && control.errors) {
      const key = Object.keys(control.errors)[0];
      return this.translate.translate(`auth.validation.${key}`)();
    }
    return null;
  }
}
