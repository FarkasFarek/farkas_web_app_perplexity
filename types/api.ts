// --- Pagination types ---------------------------------------------------
// Ujrahasznalhato minden list endpoint valasznál.

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
   T[]
  pagination: PaginationMeta
}

// --- API Error ----------------------------------------------------------

export interface ApiError {
  statusCode: number
  statusMessage: string
}
