import { adminApi } from './adminApi'

export const maintenanceApi = {
  async getStatus(): Promise<Record<string, unknown>> {
    const response = await adminApi.get('/maintenance/settings')
    return (response.data ?? {}) as Record<string, unknown>
  },

  async getHistory(): Promise<{ data: unknown[]; pagination: Record<string, unknown> }> {
    const response = await adminApi.get('/maintenance/history')
    const body = response.data as { data?: unknown[]; pagination?: Record<string, unknown> } | null
    return {
      data: Array.isArray(body?.data) ? body.data : [],
      pagination: body?.pagination ?? {},
    }
  },

  async enable(payload: { message?: string; eta?: string; reason?: string }) {
    const response = await adminApi.put('/maintenance/enable', payload)
    return response.data
  },

  async disable(payload: { notes?: string } = {}) {
    const response = await adminApi.put('/maintenance/disable', payload)
    return response.data
  },

  async schedule(payload: { startsAt?: string; endsAt?: string; message?: string; reason?: string }) {
    const response = await adminApi.put('/maintenance/schedule', {
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      message: payload.message,
      reason: payload.reason,
    })
    return response.data
  },
}