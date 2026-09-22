import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiIcon, TuiInput } from '@taiga-ui/core';
import { TuiButtonLoading, TuiInputDate } from '@taiga-ui/kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ShipmentRequestService } from '../../../core/http/shipment-request.service';
import { CARGO_TYPES } from '../../../models/enums';
import type { ApiErrorResponse } from '../../../models/api/api-error';
import type { CreateShipmentRequestDto } from '../../../models/request/shipment-request';
import { TuiDay } from '@taiga-ui/cdk';
import { BerthPickerComponent } from '../../carrier-routes/components/berth-picker.component';
import { NileBerth } from '../../carrier-routes/routes.model';
import { NileBerthService } from '../../carrier-routes/data/nile-berth.service';
import { AlertService } from '../../../core/services/alert.service';

const SERVER_FIELD_KEYS: Record<
  string,
  'cargoType' | 'weight' | 'origin' | 'destination' | 'requestedDate'
> = {
  CargoType: 'cargoType',
  Weight: 'weight',
  Origin: 'origin',
  Destination: 'destination',
  RequestedDate: 'requestedDate',
};

@Component({
  selector: 'rl-create-request-page',
  imports: [
    ReactiveFormsModule,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiInput,
    TranslatePipe,
    RouterLink,
    TuiInputDate,
    BerthPickerComponent,
    TuiIcon,
  ],
  templateUrl: './create-request-page.html',
  styleUrl: './create-request-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRequestPage {
  private readonly service = inject(ShipmentRequestService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly berthService = inject(NileBerthService);
  private readonly alerts = inject(AlertService);

  protected readonly berths = signal<NileBerth[]>([]);
  private readonly date = new Date();
  protected current = new TuiDay(
    this.date.getFullYear(),
    this.date.getMonth(),
    this.date.getDate(),
  );

  readonly cargoSuggestions = CARGO_TYPES;

  protected origin = signal<NileBerth | null>(null);
  protected destination = signal<NileBerth | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly canSave = computed(() => {
    const from = this.origin();
    const to = this.destination();
    return !!from && !!to && from.id !== to.id;
  });

  protected swap(): void {
    const from = this.origin();
    this.origin.set(this.destination());
    this.destination.set(from);
  }




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
      requestedDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: differentPorts },
  );

  readonly submitting = signal(false);
  readonly serverErrors = signal<ApiErrorResponse | null>(null);

  ngOnInit(): void {
    this.berthService.getAll().subscribe({
      next: (berths) => this.berths.set(berths),
      error: () => this.alerts.error('تعذّر تحميل قائمة المراسي.'),
    });
  }

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

  fieldError(
    key: 'cargoType' | 'weight' |  'requestedDate',
  ): string | null {
    const control = this.form.controls[key];

    if (control.touched && control.invalid && control.errors) {
      const first = Object.keys(control.errors)[0];


      return this.translate.translate(`auth.validation.${first}`)();
    }

    const server = this.serverErrors()?.errors?.find(
      (error) => error.field && SERVER_FIELD_KEYS[error.field] === key,
    );
    return server?.message ?? null;
  }

  submit(): void {
    const from = this.origin();
    const to = this.destination();

    if (!from || !to) {
      return;
    }
    if (from.id === to.id) {
      this.error.set('ميناء القيام وميناء الوصول لا يمكن أن يكونا نفس الميناء.');
      return;
    }
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
      originNileBerthId: this.origin()!.id,
      destinationNileBerthId: this.destination()!.id,
      requestedDate: raw.requestedDate,
    };

    this.service.create(payload).subscribe({
      next: (created) => {

        this.router.navigate(['/requests', created.id]);
      },
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

  if (
    origin.trim() &&
    destination.trim() &&
    origin.trim().toLowerCase() === destination.trim().toLowerCase()
  ) {
    return { originDestinationDiffers: true };
  }

  return null;
}


