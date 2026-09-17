import type { UserRole } from '../enums';

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly companyName?: string;
}