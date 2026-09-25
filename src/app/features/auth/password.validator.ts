import type { AbstractControl } from '@angular/forms';

export function strongPassword(control: AbstractControl): Record<string, boolean> | null {
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
