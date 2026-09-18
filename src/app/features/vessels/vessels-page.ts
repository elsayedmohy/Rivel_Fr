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
import { VesselService } from '../../core/mock/vessel.service';
import type { VesselStatus } from '../../models/enums';

@Component({
  selector: 'rl-vessels-page',
  imports: [ReactiveFormsModule, TuiButton, TuiError, TuiIcon, TuiInput, TranslatePipe],
  templateUrl: './vessels-page.html',
  styleUrl: './vessels-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VesselsPage {
  private readonly service = inject(VesselService);
  private readonly translate = inject(TranslateService);

  readonly vessels = this.service.vessels;
  readonly showForm = signal(false);

  readonly form = new FormGroup({
    type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    capacity: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, greaterThanZero],
    }),
  });

  fieldError(key: 'type' | 'capacity'): string | null {
    const control = this.form.controls[key];
    if (control.invalid && control.errors) {
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
    this.service.create({
      type: raw.type.trim(),
      capacity: Number(raw.capacity),
      status: 'Available',
    });
    this.form.reset();
    this.showForm.set(false);
  }

  toggleStatus(id: string, status: VesselStatus): void {
    this.service.updateStatus(id, status === 'Available' ? 'OnTrip' : 'Available');
  }

  remove(id: string): void {
    this.service.remove(id);
  }

  statusLabel(status: VesselStatus): string {
    return this.translate.translate(`vessels.status.${status}`)();
  }
}

function greaterThanZero(control: AbstractControl): ValidationErrors | null {
  const value = Number(control.value);
  if (control.value === '' || Number.isNaN(value)) {
    return null;
  }
  return value > 0 ? null : { greaterThanZero: true };
}