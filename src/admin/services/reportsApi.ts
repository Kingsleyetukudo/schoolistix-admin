import { adminApi } from './adminApi'

export interface ReportsOverview {
  stats: Record<string, unknown>
  charts: Record<string, unknown>
}

export const reportsApi = {
  async dashboard(): Promise<ReportsOverview> {
    const [statsResponse, chartsResponse] = await Promise.all([
      adminApi.get('/stats'),
      adminApi.get('/stats/charts', { params: { days: 30 } }),
    ])
    return {
      stats: (statsResponse.data ?? {}) as Record<string, unknown>,
      charts: (chartsResponse.data ?? {}) as Record<string, unknown>,
    }
  },
}