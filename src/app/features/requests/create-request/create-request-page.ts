import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ShipmentRequestService } from '../../../core/http/shipment-request.service';
import { CARGO_TYPES } from '../../../models/enums';
import type { ApiErrorResponse } from '../../../models/api/api-error';
import type { CreateShipmentRequestDto } from '../../../models/request/shipment-request';

const SERVER_FIELD_KEYS: Record<string, 'cargoType' | 'weight' | 'origin' | 'destination' | 'requestedDate'> = {
  CargoType: 'cargoType',
  Weight: 'weight',
  Origin: 'origin',
  Destination: 'destination',
  RequestedDate: 'requestedDate',
};

@Component({
  selector: 'rl-create-request-page',
  imports: [ReactiveFormsModule, TuiButton, TuiButtonLoading, TuiError, TuiInput, TranslatePipe],
  templateUrl: './create-request-page.html',
  styleUrl: './create-request-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRequestPage {
  private readonly service = inject(ShipmentRequestService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly cargoSuggestions = CARGO_TYPES;

  readonly minDate = today();

  readonly form = new FormGroup(
    {
      cargoType: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      weight: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, greaterThanZero],
      }),
      origin: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      destination: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      requestedDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: differentPorts },
  );

  readonly submitting = signal(false);
  readonly serverErrors = signal<ApiErrorResponse | null>(null);

  pickCargoType(value: string): void {
    this.form.controls.cargoType.setValue(value);
    this.form.controls.cargoType.markAsTouched();
  }

  isCargoPicked(value: string): boolean {
    return this.form.controls.cargoType.value === value;
  }

  isServerFieldMessage(field: string | undefined): boolean {
    return !!field && field in SERVER_FIELD_KEYS;
  }

  fieldError(key: 'cargoType' | 'weight' | 'origin' | 'destination' | 'requestedDate'): string | null {
    const control = this.form.controls[key];

    if (control.invalid && control.errors) {
      const first = Object.keys(control.errors)[0];

      if (first === 'originDestinationDiffers' && key !== 'destination') {
        return null;
      }

      return this.translate.translate(`auth.validation.${first}`)();
    }

    const server = this.serverErrors()
      ?.errors?.find((error) => error.field && SERVER_FIELD_KEYS[error.field] === key);
    return server?.message ?? null;
  }

  submit(): void {
    this.serverErrors.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const payload: CreateShipmentRequestDto = {
      cargoType: raw.cargoType.trim(),
      weight: Number(raw.weight),
      origin: raw.origin.trim(),
      destination: raw.destination.trim(),
      requestedDate: raw.requestedDate,
    };

    this.service.create(payload).subscribe({
      next: (created) => void this.router.navigate(['/app/requests', created.id]),
      error: (error: ApiErrorResponse) => {
        this.submitting.set(false);
        this.serverErrors.set(error);
      },
    });
  }
}

function greaterThanZero(control: AbstractControl): ValidationErrors | null {
  const value = Number(control.value);

  if (control.value === '' || Number.isNaN(value)) {
    return null;
  }

  return value > 0 ? null : { greaterThanZero: true };
}

function differentPorts(form: AbstractControl): ValidationErrors | null {
  const origin = String(form.get('origin')?.value ?? '');
  const destination = String(form.get('destination')?.value ?? '');

  if (origin.trim() && destination.trim() && origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
    return { originDestinationDiffers: true };
  }

  return null;
}

function today(): string {
  const value = new Date();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}