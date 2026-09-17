import type { Signal } from '@angular/core';
import type { UserRole } from '../../models/enums';

export interface QuickAction {
  readonly routerLink: string;
  readonly icon: string;
  readonly label: Signal<string>;
  readonly hint: Signal<string>;
  readonly role?: UserRole;
}