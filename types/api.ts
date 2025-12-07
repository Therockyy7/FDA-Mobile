// Generic API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApiListResponse<T> {
  data: T[];
  error: string | null;
}

// Pagination types
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}