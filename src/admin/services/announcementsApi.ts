import { adminApi } from './adminApi'

export const announcementsApi = {
  async list(): Promise<Array<Record<string, unknown>>> {
    const response = await adminApi.get('/announcements')
    const body = response.data as { data?: unknown[] } | null
    return Array.isArray(body?.data) ? (body.data as Array<Record<string, unknown>>) : []
  },

  async create(payload: Record<string, unknown>) {
    const response = await adminApi.post('/announcements', payload)
    return response.data
  },
}