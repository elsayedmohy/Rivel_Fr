import type { UserRole } from '../enums';

/** POST /api/auth/register, POST /api/auth/login */
export interface AuthResponseDto {
  readonly token: string;
  readonly userId: string;
  readonly role: string;
}

/**
 * Both register and login share this envelope:
 * - success: `{ response, errors: [], succeeded: true }`
 * - register identity failure (e.g. duplicate email): HTTP 200 with
 *   `response: null` + Identity errors
 */
export interface AuthResultDto {
  readonly response: AuthResponseDto | null;
  readonly errors: IdentityError[];
  readonly succeeded: boolean;
}

export interface IdentityError {
  readonly code: string;
  readonly description: string;
}

export interface CredentialsDto {
  readonly email: string;
  readonly password: string;
}

export interface RegisterDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
  readonly companyName?: string;
}