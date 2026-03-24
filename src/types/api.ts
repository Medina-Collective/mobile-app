/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Standard API error shape
 */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
