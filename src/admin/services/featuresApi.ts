import { adminApi } from './adminApi'

export interface FeatureFlagItem {
  key: string
  label: string
  description: string
  enabled: boolean
}

const normalizeCatalog = (payload: unknown): FeatureFlagItem[] => {
  const body = payload as { feature_flag_catalog?: FeatureFlagItem[] } | null
  return Array.isArray(body?.feature_flag_catalog) ? body.feature_flag_catalog : []
}

export const featuresApi = {
  async list(): Promise<FeatureFlagItem[]> {
    const response = await adminApi.get('/settings')
    return normalizeCatalog(response.data)
  },
  async update(key: string, enabled: boolean) {
    const response = await adminApi.put(`/features/${key}`, { enabled })
    return response.data
  },
}