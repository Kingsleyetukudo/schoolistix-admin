import { adminApi } from './adminApi'

export interface AuditEntry {
  id: string
  action: string
  target_type: string
  target_id: string
  target_school: { id: string; name: string } | null
  ip_address: string
  created_at: string
  details: Record<string, unknown>
  admin_user: { id: string; name: string; email: string; role: string } | null
}

export interface AuditListResponse {
  data: AuditEntry[]
  pagination: { page: number; per_page: number; total: number; total_pages: number }
}

export const auditApi = {
  async list(filters: { page?: number; limit?: number; query?: string; action?: string; targetType?: string } = {}): Promise<AuditListResponse> {
    const response = await adminApi.get('/audit-logs', {
      params: {
        page: filters.page,
        per_page: filters.limit,
        query: filters.query,
        action: filters.action,
        target_type: filters.targetType,
      },
    })
    const body = response.data as {
      data?: unknown[]
      pagination?: { page?: number; per_page?: number; total?: number; total_pages?: number }
    } | null
    return {
      data: Array.isArray(body?.data) ? (body.data as AuditEntry[]) : [],
      pagination: {
        page: Number(body?.pagination?.page ?? 1),
        per_page: Number(body?.pagination?.per_page ?? 20),
        total: Number(body?.pagination?.total ?? 0),
        total_pages: Number(body?.pagination?.total_pages ?? 1),
      },
    }
  },
}