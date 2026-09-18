import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiIcon, TuiInput, TuiTextfieldContent } from '@taiga-ui/core';
import { TuiButtonLoading, TuiRadioList } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { startWith } from 'rxjs';
import { AuthService } from '../../../core/http/auth.service';
import type { ApiErrorResponse } from '../../../models/api/api-error';
import type { RegisterDto } from '../../../models/auth/auth';
import type { UserRole } from '../../../models/enums';

@Component({
  selector: 'rl-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiIcon,
    TuiInput,
    TuiRadioList,
    TuiTextfieldContent,
    TranslatePipe,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly roles: readonly UserRole[] = ['CargoOwner', 'Carrier'];

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, strongPasswordValidator],
    }),
    role: new FormControl<UserRole>('CargoOwner', { nonNullable: true }),
    companyName: new FormControl('', { nonNullable: true }),
  });

  readonly isCarrier = toSignal(this.form.controls.role.valueChanges.pipe(startWith('CargoOwner' as UserRole)), {
    initialValue: 'CargoOwner' as UserRole,
  });

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly serverErrors = signal<ApiErrorResponse | null>(null);

  constructor() {
    this.form.controls.companyName.addValidators(companyNameValidator(this.form));
    this.form.controls.role.valueChanges.subscribe(() =>
      this.form.controls.companyName.updateValueAndValidity(),
    );
  }

  fieldError(key: 'name' | 'email' | 'password' | 'companyName'): string | null {
    const control = this.form.controls[key];
    if (control.invalid && control.errors) {
      const firstKey = Object.keys(control.errors)[0];
      return this.translate.translate(`auth.validation.${firstKey}`)();
    }
    return null;
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
    const raw = this.form.getRawValue();
    const payload: RegisterDto = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      password: raw.password,
      role: raw.role,
      ...(raw.role === 'Carrier' ? { companyName: raw.companyName.trim() } : {}),
    };

    this.authService.register(payload).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (error: ApiErrorResponse) => {
        this.submitting.set(false);
        this.serverErrors.set(error);
      },
    });
  }
}

function strongPasswordValidator(control: AbstractControl): Record<string, boolean> | null {
  const value = control.value as string;

  if (!value) {
    return null;
  }

  const valid =
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

  return valid ? null : { strongPassword: true };
}

function companyNameValidator(form: FormGroup): ValidatorFn {
  return (control: AbstractControl): Record<string, boolean> | null => {
    if (form.controls['role'].value !== 'Carrier') {
      return null;
    }

    const value = ((control.value as string) ?? '').trim();

    if (!value) {
      return { required: true };
    }

    return value.length > 200 ? { maxlength: true } : null;
  };
}
