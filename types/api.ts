// --- Pagination types ---------------------------------------------------
// Ujrahasznalhato minden list endpoint valasznál.

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// --- API Error ----------------------------------------------------------

export interface ApiError {
  statusCode: number
  statusMessage: string
}
