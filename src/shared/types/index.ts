// Shared Types - App-weite TypeScript Definitionen

/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API Error Struktur
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Result Type für sichere Fehlerbehandlung
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async State für Hooks
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Pagination Parameter
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
