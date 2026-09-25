import { HttpErrorResponse } from '@angular/common/http';
import type { TranslateService } from '@ngx-translate/core';
import type { ApiError, ApiErrorResponse, ProblemDetails } from '../../models/api/api-error';

function isProblemDetails(body: unknown): body is ProblemDetails {
  return !!body && typeof body === 'object' && 'errors' in body && body !== null;
}


export function toApiErrorResponse(error: unknown): ApiErrorResponse {
  if (isApiErrorResponse(error)) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;

    if (isProblemDetails(body) && body.errors) {
      const errors: ApiError[] = Object.entries(body.errors).map(([field, messages]) => ({
        field,
        message: messages[0] ?? field,
      }));
      return {
        message: firstError(errors) ?? 'Validation failed.',
        errors,
      };
    }

    if (typeof body === 'string' && body.trim()) {
      return { message: body.trim() };
    }

    const fallback =
      error.status === 0
        ? 'Network error. Check your connection and try again.'
        : `Request failed (${error.status}).`;
    return { message: fallback };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message };
  }

  return { message: 'Something went wrong.' };
}

export function toApiErrorResponseFromIdentity(identityErrors: ApiError[]): ApiErrorResponse {
  return {
    message: firstError(identityErrors) ?? 'Registration failed.',
    errors: identityErrors,
  };
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object' || !('message' in value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return (
    (prototype === Object.prototype || prototype === null) &&
    typeof value.message === 'string'
  );
}

function firstError(errors: ApiError[]): string | null {
  return errors[0]?.message ?? null;
}


/** Translates a stable backend error code (plain-text body) via `errors.<code>`, else falls back to the raw message. */
export function apiErrorText(error: unknown, translate: TranslateService): string {
  const message = toApiErrorResponse(error).message;
  const key = `errors.${message}`;
  const translated = translate.instant(key);
  return translated === key ? message : translated;
}
