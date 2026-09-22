import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TuiButton, TuiError, TuiIcon, TuiInput } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { VesselService } from '../../core/http/vessel.service';
import { VESSEL_TYPES } from '../../models/enums';
import type { VesselStatus, VesselType } from '../../models/enums';
import type { VesselDto } from '../../models/vessel/vessel';
import { RlCard } from '../../shared/components/rl-card/rl-card';

@Component({
  selector: 'rl-vessels-page',
  imports: [ReactiveFormsModule, TuiButton, TuiError, TuiIcon, TuiInput, TranslatePipe, RlCard],
  templateUrl: './vessels-page.html',
  styleUrl: './vessels-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VesselsPage {
  private readonly service = inject(VesselService);
  private readonly translate = inject(TranslateService);

  readonly vesselTypes = VESSEL_TYPES;
  readonly vessels = signal<VesselDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    type: new FormControl<VesselType>('Barge', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    registrationNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    capacity: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, greaterThanZero],
    }),
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.list().subscribe({
      next: (vessels) => {
        this.vessels.set(vessels);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set((error as { message?: string }).message ?? 'vessels.error.load');
        this.loading.set(false);
      },
    });
  }

  fieldError(key: 'name' | 'type' | 'registrationNumber' | 'capacity'): string | null {
    const control = this.form.controls[key];
    if (control.touched &&  control.invalid && control.errors) {
      const first = Object.keys(control.errors)[0];
      return this.translate.translate(`auth.validation.${first}`)();
    }
    return null;
  }

  add(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.service
      .create({
        name: raw.name.trim(),
        type: raw.type,
        registrationNumber: raw.registrationNumber.trim(),
        capacity: Number(raw.capacity),
      })
      .subscribe({
        next: () => {
          this.form.reset({ type: 'Barge' });
          this.showForm.set(false);
          this.reload();
        },
        error: (error: unknown) => {
          this.error.set((error as { message?: string }).message ?? 'vessels.error.create');
        },
      });
  }

  statusLabel(status: VesselStatus): string {
    return this.translate.translate(`vessels.status.${status}`)();
  }

  capacityText(vessel: VesselDto): string {
    return `${vessel.capacity.toLocaleString()} ${vessel.capacityUnit}`;
  }
}

function greaterThanZero(control: AbstractControl): ValidationErrors | null {
  const value = Number(control.value);
  if (control.value === '' || Number.isNaN(value)) {
    return null;
  }
  return value > 0 ? null : { greaterThanZero: true };
}
