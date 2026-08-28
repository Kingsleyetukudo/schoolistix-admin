import { adminApi } from './adminApi'

export interface AdminSubscription {
  school_id: string
  school_name: string
  admin_email: string | null
  plan: string
  plan_name: string | null
  billing_cycle: string | null
  status: string
  is_active: boolean
  amount: number
  currency: string
  cancel_at_period_end: boolean
  current_period_end: string | null
  next_billing_at: string | null
  last_payment_at: string | null
  pending_plan: string | null
  pending_billing_cycle: string | null
  student_count: number
  storage_used_bytes: number
  storage_readable: string
}

export interface AdminSubscriptionListResponse {
  data: AdminSubscription[]
  pagination: { total: number; page: number; limit: number }
}

export interface AdminSubscriptionFilters {
  page?: number
  limit?: number
  status?: string
  plan?: string
  search?: string
}

const normalizeSubscription = (item: Record<string, unknown>): AdminSubscription => ({
  school_id: String(item.school_id ?? item.schoolId ?? item.id ?? ''),
  school_name: String(item.school_name ?? item.schoolName ?? ''),
  admin_email: item.admin_email ? String(item.admin_email) : null,
  plan: String(item.plan ?? 'free'),
  plan_name: item.plan_name ? String(item.plan_name) : null,
  billing_cycle: item.billing_cycle ? String(item.billing_cycle) : null,
  status: String(item.status ?? 'inactive'),
  is_active: Boolean(item.is_active ?? item.isActive),
  amount: Number(item.amount ?? 0),
  currency: String(item.currency ?? 'NGN'),
  cancel_at_period_end: Boolean(item.cancel_at_period_end ?? item.cancelAtPeriodEnd),
  current_period_end: item.current_period_end ? String(item.current_period_end) : null,
  next_billing_at: item.next_billing_at ? String(item.next_billing_at) : null,
  last_payment_at: item.last_payment_at ? String(item.last_payment_at) : null,
  pending_plan: item.pending_plan ? String(item.pending_plan) : null,
  pending_billing_cycle: item.pending_billing_cycle ? String(item.pending_billing_cycle) : null,
  student_count: Number(item.student_count ?? 0),
  storage_used_bytes: Number(item.storage_used_bytes ?? 0),
  storage_readable: String(item.storage_readable ?? '0 B'),
})

export const subscriptionsApi = {
  async list(filters: AdminSubscriptionFilters = {}): Promise<AdminSubscriptionListResponse> {
    const response = await adminApi.get('/subscriptions', {
      params: {
        page: filters.page,
        per_page: filters.limit,
        status: filters.status || undefined,
        plan: filters.plan || undefined,
        query: filters.search || undefined,
      },
    })
    const body = response.data as {
      data?: unknown[]
      pagination?: { total?: number; page?: number; limit?: number; per_page?: number }
    } | null
    return {
      data: Array.isArray(body?.data)
        ? body.data.map((item) => normalizeSubscription(item as Record<string, unknown>))
        : [],
      pagination: {
        total: Number(body?.pagination?.total ?? 0),
        page: Number(body?.pagination?.page ?? 1),
        limit: Number(body?.pagination?.limit ?? body?.pagination?.per_page ?? 20),
      },
    }
  },

  async get(schoolId: string) {
    const response = await adminApi.get(`/subscriptions/${schoolId}`)
    return response.data
  },

  async cancel(schoolId: string) {
    const response = await adminApi.post(`/subscriptions/${schoolId}/cancel`)
    return response.data
  },
}