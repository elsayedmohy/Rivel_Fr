import { HttpErrorResponse } from '@angular/common/http';
import {
  toApiErrorResponse,
  toApiErrorResponseFromIdentity,
} from './api-error.util';

describe('api-error.util', () => {
  describe('toApiErrorResponse', () => {
    it('maps ASP.NET ValidationProblemDetails to per-field errors', () => {
      const response = toApiErrorResponse(
        new HttpErrorResponse({
          status: 400,
          error: {
            title: 'One or more validation errors occurred.',
            errors: {
              Email: ['The Email field is not a valid e-mail address.'],
              Password: ['The Password field is required.'],
            },
          },
        }),
      );

      expect(response.message).toBe('The Email field is not a valid e-mail address.');
      expect(response.errors).toEqual([
        { field: 'Email', message: 'The Email field is not a valid e-mail address.' },
        { field: 'Password', message: 'The Password field is required.' },
      ]);
    });

    it('maps a plain-text body (e.g. invalid credentials) to a single message', () => {
      const response = toApiErrorResponse(
        new HttpErrorResponse({ status: 401, error: 'Invalid email or password' }),
      );

      expect(response).toEqual({ message: 'Invalid email or password' });
    });

    it('returns a fallback message for network-level failures', () => {
      const response = toApiErrorResponse(new HttpErrorResponse({ status: 0 }));

      expect(response.message).toContain('Network error');
      expect(response.errors).toBeUndefined();
    });

    it('passes existing ApiErrorResponse through unchanged', () => {
      const input = { message: 'Kept', errors: [{ field: 'f', message: 'm' }] };
      expect(toApiErrorResponse(input)).toBe(input);
    });
  });

  describe('toApiErrorResponseFromIdentity', () => {
    it('builds a response from Identity errors (register envelope)', () => {
      const response = toApiErrorResponseFromIdentity([
        { field: 'DuplicateUserName', message: "User Name 'x' is already taken." },
      ]);

      expect(response.message).toBe("User Name 'x' is already taken.");
      expect(response.errors?.[0]?.field).toBe('DuplicateUserName');
    });

    it('falls back to a generic message when the list is empty', () => {
      expect(toApiErrorResponseFromIdentity([]).message).toBe('Registration failed.');
    });
  });
});