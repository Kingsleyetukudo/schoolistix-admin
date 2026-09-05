import { adminApi } from './adminApi'

export interface AiFeatureUsageRow {
  feature: string
  label: string
  requests: number
  errors: number
  blocked: number
}

export interface AiSchoolUsageRow {
  schoolId: string
  plan: string
  subscriptionStatus: string
  requests: number
  errors: number
  blocked: number
}

export interface AiQuotaState {
  limited: boolean
  allowed: boolean
  used: number
  remaining: number | null
  percent: number
}

export interface AiSchoolQuotaRow {
  schoolId: string
  schoolName: string
  billingPlan: string
  subscriptionStatus: string
  monthlyRequestLimitOverride: number | null
  quota: AiQuotaState
}

export interface AiSummary {
  total: number
  errors: number
  blocked: number
  success: number
  errorRate: number
}

export interface AiHealthResponse {
  ok: boolean
  last24h: AiSummary
  last7d: AiSummary
  lastRequestAt: string | null
  provider: {
    configured: boolean
    defaultModel: string
  }
  killSwitchEnabled: boolean
}

export interface AiPlatformDefaults {
  enabledFeatures: Record<string, boolean>
  killSwitch: boolean
  defaultModel: string
  ragEnabled: boolean
  monthlyRequestLimit: number | null
}

export interface AiSettingsResponse {
  defaults: AiPlatformDefaults
  features: Record<string, { label: string; defaultEnabled: boolean }>
  updatedAt: string | null
}

export interface AiUsageResponse {
  range: { from: string; to: string }
  total: number
  errors: number
  blocked: number
  byStatus: Record<string, number>
  byFeature: Record<string, { requests: number; errors: number; blocked: number }>
  daily: Array<{ date: string; requests: number; errors: number; blocked: number }>
}

export interface AiPagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface AiSchoolRef {
  id: string
  name: string
  billingPlan: string
}

export interface AiFeedbackRow {
  id: string
  schoolId: string
  school: AiSchoolRef | null
  actorId: string | null
  messageId: string | null
  feature: string
  featureLabel: string
  rating: string
  reason: string | null
  comment: string | null
  createdAt: string
}

export interface AiFeedbackResponse {
  data: AiFeedbackRow[]
  summary: { total: number; byRating: Record<string, number> }
  pagination: AiPagination
}

export interface AiAuditRow {
  id: string
  schoolId: string | null
  school: AiSchoolRef | null
  actorType: string
  actorId: string | null
  action: string
  target: string | null
  meta: Record<string, unknown>
  createdAt: string
}

export interface AiAuditResponse {
  data: AiAuditRow[]
  summary: { total: number; byAction: Record<string, number> }
  pagination: AiPagination
}

export interface AiKnowledgeSummary {
  totalDocuments: number
  totalChunks: number
  activeDocuments: number
  readyDocuments: number
  failedDocuments: number
  deactivatedDocuments: number
  ingestionSuccessRate: number
  byStatus: Record<string, number>
  byFormat: Record<string, number>
  byDocType: Record<string, number>
  documentLimitPerSchool: number
  storageLimitBytesPerSchool: number
  totalStorageBytes: number
  embeddings: {
    enabled: boolean
    model: string
    dimensions: number
    columnAvailable: boolean | null
  }
}

export interface AiKnowledgeSchoolRow {
  id: string
  name: string
  billingPlan: string
  subscriptionStatus: string
  totalDocuments: number
  activeDocuments: number
  readyDocuments: number
  failedDocuments: number
  deactivatedDocuments: number
  byStatus: Record<string, number>
  chunkCount: number
  lastUploadAt: string | null
  documentLimit: number
  atDocumentLimit: boolean
  storageBytes: number
  storageLimitBytes: number
}

export interface AiKnowledgeSummaryResponse {
  summary: AiKnowledgeSummary
  labels: {
    statuses: Record<string, string>
    formats: Record<string, string>
    docTypes: Record<string, string>
  }
  schools: AiKnowledgeSchoolRow[]
  pagination: { page: number; perPage: number; total: number; totalPages: number }
  filter: { schoolId: string | null }
}

export const aiApi = {
  async usage(params: Record<string, unknown> = {}): Promise<AiUsageResponse> {
    const response = await adminApi.get('/ai/usage', { params })
    return (response.data ?? {}) as AiUsageResponse
  },
  async usageByFeatures(): Promise<{ features: AiFeatureUsageRow[] }> {
    const response = await adminApi.get('/ai/usage/features')
    return (response.data ?? { features: [] }) as { features: AiFeatureUsageRow[] }
  },
  async usageBySchools(): Promise<{ schools: AiSchoolUsageRow[] }> {
    const response = await adminApi.get('/ai/usage/schools')
    return (response.data ?? { schools: [] }) as { schools: AiSchoolUsageRow[] }
  },
  async quotas(): Promise<{ schools: AiSchoolQuotaRow[] }> {
    const response = await adminApi.get('/ai/quotas')
    return (response.data ?? { schools: [] }) as { schools: AiSchoolQuotaRow[] }
  },
  async health(): Promise<AiHealthResponse> {
    const response = await adminApi.get('/ai/health')
    return (response.data ?? {}) as AiHealthResponse
  },
  async settings(): Promise<AiSettingsResponse> {
    const response = await adminApi.get('/ai/settings')
    return (response.data ?? {}) as AiSettingsResponse
  },
  async saveSettings(payload: Partial<AiPlatformDefaults>): Promise<{ ok: boolean; defaults: AiPlatformDefaults }> {
    const response = await adminApi.put('/ai/settings', payload)
    return (response.data ?? {}) as { ok: boolean; defaults: AiPlatformDefaults }
  },
  async schoolSettings(schoolId: string): Promise<Record<string, unknown>> {
    const response = await adminApi.get(`/ai/schools/${encodeURIComponent(schoolId)}/settings`)
    return (response.data ?? {}) as Record<string, unknown>
  },
  async saveSchoolSettings(schoolId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await adminApi.put(`/ai/schools/${encodeURIComponent(schoolId)}/settings`, payload)
    return (response.data ?? {}) as Record<string, unknown>
  },
  async feedback(params: Record<string, unknown> = {}): Promise<AiFeedbackResponse> {
    const response = await adminApi.get('/ai/feedback', { params })
    return (response.data ?? { data: [], summary: { total: 0, byRating: {} }, pagination: { page: 1, perPage: 25, total: 0, totalPages: 1 } }) as AiFeedbackResponse
  },
  async audit(params: Record<string, unknown> = {}): Promise<AiAuditResponse> {
    const response = await adminApi.get('/ai/audit', { params })
    return (response.data ?? { data: [], summary: { total: 0, byAction: {} }, pagination: { page: 1, perPage: 25, total: 0, totalPages: 1 } }) as AiAuditResponse
  },
  async knowledgeSummary(params: Record<string, unknown> = {}): Promise<AiKnowledgeSummaryResponse> {
    const response = await adminApi.get('/ai/knowledge/summary', { params })
    return (response.data ?? {}) as AiKnowledgeSummaryResponse
  },
}