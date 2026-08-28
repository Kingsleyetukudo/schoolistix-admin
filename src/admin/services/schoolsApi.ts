import { adminApi } from './adminApi'
import type { School } from '@admin/types/school.types'

export interface AdminSchoolListResponse {
  data: School[]
  pagination: { total: number; page: number; limit: number }
}

const normalizeSchoolList = (payload: unknown): AdminSchoolListResponse => {
  const body = payload as { data?: Array<Record<string, unknown>>; pagination?: Record<string, unknown> } | null
  const data = Array.isArray(body?.data) ? body.data : []
  return {
    data: data.map((school) => ({
      id: school.id,
      name: school.name,
      subdomain: school.subdomain ?? school.domain ?? '',
      plan: school.plan ?? 'free',
      status: school.status ?? 'active',
      students: Number(school.students_count ?? school.student_count ?? 0),
      staff: Number(school.teachers_count ?? school.staff ?? 0),
      storageGb: Number(school.storage_used_mb ?? school.storageGb ?? 0),
      createdAt: school.registered_at ?? school.created_at ?? null,
    })) as School[],
    pagination: {
      total: Number(body?.pagination?.total ?? data.length),
      page: Number(body?.pagination?.page ?? 1),
      limit: Number(body?.pagination?.per_page ?? body?.pagination?.limit ?? 20),
    },
  }
}

export const schoolsApi = {
  async list(filters: Record<string, unknown>): Promise<AdminSchoolListResponse> {
    const response = await adminApi.get('/schools', {
      params: {
        page: filters.page,
        per_page: filters.limit,
        query: filters.search || undefined,
        status: filters.status || undefined,
        plan: filters.plan || undefined,
      },
    })
    return normalizeSchoolList(response.data)
  },
  async get(id: string) {
    const response = await adminApi.get(`/schools/${id}`)
    return response.data
  },
  async updateStatus(id: string, status: string, _reason?: string) {
    const response = await adminApi.put(`/schools/${id}/status`, { status })
    return response.data
  },
  async loginAs(id: string) {
    const response = await adminApi.post(`/schools/${id}/login-as`)
    return response.data
  },
  async saveNote(id: string, note: string) {
    const response = await adminApi.put(`/schools/${id}/notes`, { note })
    return response.data
  },
    async activateTester(
    id: string,
    payload: { plan?: string; billingCycle?: string; durationDays?: number; note?: string } = {},
  ) {
    const response = await adminApi.post(`/schools/${id}/activate-tester`, payload)
    return response.data
  },
}