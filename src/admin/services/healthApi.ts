import { adminApi } from './adminApi'

export const healthApi = {
  async overview(): Promise<Record<string, unknown>> {
    const response = await adminApi.get('/health')
    return (response.data ?? {}) as Record<string, unknown>
  },
}