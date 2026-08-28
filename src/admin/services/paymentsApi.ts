import { adminApi } from './adminApi'

export interface AdminPaymentListParams {
  page?: number
  limit?: number
  status?: string
  gateway?: string
  kind?: string
  search?: string
}

export interface AdminPaymentListResponse {
  data: Array<Record<string, unknown>>
  pagination: { total: number; page: number; limit: number }
}

const normalizeListResponse = (payload: unknown): AdminPaymentListResponse => {
  const body = payload as AdminPaymentListResponse | null
  return {
    data: Array.isArray(body?.data) ? body.data : [],
    pagination: body?.pagination ?? { total: 0, page: 1, limit: 20 },
  }
}

export const paymentsApi = {
  async list(params: AdminPaymentListParams = {}): Promise<AdminPaymentListResponse> {
    const response = await adminApi.get('/payments', { params })
    return normalizeListResponse(response.data)
  },
  async failed() {
    return (await this.list({ status: 'failed' })).data
  },
  async approve(id: string) {
    const response = await adminApi.post(`/payments/${id}/approve`)
    return response.data
  },
  async reject(id: string, reason?: string) {
    const response = await adminApi.post(`/payments/${id}/reject`, { reason })
    return response.data
  },
}