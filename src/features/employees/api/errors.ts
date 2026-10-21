export type ApiErrorCode = 'NETWORK' | 'DUPLICATE_EMAIL' | 'NOT_FOUND' | 'VALIDATION';

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** User-facing copy. The raw `error.message` stays available for debugging. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'DUPLICATE_EMAIL':
        return 'Another employee already uses this email address.';
      case 'NOT_FOUND':
        return 'This employee no longer exists. Refresh the list and try again.';
      case 'VALIDATION':
        return 'Some of the details are invalid. Check the form and try again.';
      case 'NETWORK':
        return 'We couldn’t reach the server. Check your connection and try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
