import type { UserRole } from '../enums';

export interface AuthResponseDto {
  readonly token: string;
  readonly refreshToken: string;
  readonly userId: string;
  readonly role: string;
}

export interface ForgotPasswordDto {
  readonly email: string;
}

export interface ResetPasswordDto {
  readonly email: string;
  readonly token: string;
  readonly newPassword: string;
}

export interface ConfirmEmailDto {
  readonly userId: string;
  readonly token: string;
}

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

export interface TokensResponseDto {
  readonly accessToken: string;
  readonly refreshToken: string;
}
