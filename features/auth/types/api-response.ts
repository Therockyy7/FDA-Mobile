/**
 * Standard API response wrapper pattern.
 * Services return this instead of throwing, letting callers handle errors.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
