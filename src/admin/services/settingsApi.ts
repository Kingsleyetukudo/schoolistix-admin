import { adminApi } from './adminApi'

export const settingsApi = {
  async get(): Promise<Record<string, unknown>> {
    const response = await adminApi.get('/settings')
    return (response.data ?? {}) as Record<string, unknown>
  },

  async save(payload: Record<string, unknown>) {
    const response = await adminApi.put('/settings', payload)
    return response.data
  },
}