export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: Record<string, string[]>;
}

export interface ApiError {
  readonly message: string;
  readonly field?: string;
  readonly code?: string;
}

export interface ApiErrorResponse {
  readonly message: string;
  readonly errors?: ApiError[];
}