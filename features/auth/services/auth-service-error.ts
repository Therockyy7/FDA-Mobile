// features/auth/services/auth-service-error.ts
// Custom error class for auth service errors

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public canRetry: boolean = true,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }

  static fromResponse(error: unknown): AuthServiceError {
    if (error instanceof AuthServiceError) {
      return error;
    }

    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };

    const message = err.response?.data?.message || err.message || "Unknown auth error";
    const statusCode = err.response?.status;
    const canRetry = statusCode ? statusCode >= 500 : true;

    // Map common status codes to error codes
    let code = "UNKNOWN_ERROR";
    if (statusCode === 401) code = "INVALID_CREDENTIALS";
    else if (statusCode === 403) code = "FORBIDDEN";
    else if (statusCode === 404) code = "NOT_FOUND";
    else if (statusCode === 429) code = "RATE_LIMITED";
    else if (statusCode && statusCode >= 500) code = "SERVER_ERROR";

    return new AuthServiceError(message, code, statusCode, canRetry);
  }
}
