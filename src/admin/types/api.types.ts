export interface ApiListResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
  }
}
