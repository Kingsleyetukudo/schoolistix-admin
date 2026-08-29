import { ref } from 'vue'
import { defineStore } from 'pinia'
import { schoolsApi } from '@admin/services/schoolsApi'
import type { School, SchoolFilters, SchoolStats } from '@admin/types/school.types'

export const useSchoolsStore = defineStore('adminSchools', () => {
  const schools = ref<School[]>([])
  const selectedSchool = ref<School | null>(null)
  const stats = ref<SchoolStats | null>(null)
  const isLoading = ref(false)
  const total = ref(0)
  const filters = ref<SchoolFilters>({ page: 1, limit: 20, status: null, plan: null, search: '' })

  async function fetchSchools(overrides: Partial<SchoolFilters> = {}) {
    isLoading.value = true
    try {
      const requestFilters = { ...filters.value, ...overrides }
      const response = await schoolsApi.list(requestFilters)
      schools.value = response.data
      total.value = response.pagination.total
      stats.value = {
        totalSchools: Number(response.pagination.total ?? response.data.length),
        activeSchools: response.data.filter((item: School) => item.status === 'active').length,
        trialSchools: response.data.filter((item: School) => item.status === 'trial').length,
        suspendedSchools: response.data.filter((item: School) => item.status === 'suspended').length,
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSchool(id: string) {
    isLoading.value = true
    try {
      selectedSchool.value = await schoolsApi.get(id)
    } finally {
      isLoading.value = false
    }
  }

  async function suspendSchool(id: string, reason?: string) {
    await schoolsApi.updateStatus(id, 'suspended', reason)
    await fetchSchools()
  }

  async function activateSchool(id: string) {
    await schoolsApi.updateStatus(id, 'active')
    await fetchSchools()
  }

  async function loginAsSchool(id: string) {
    const result = await schoolsApi.loginAs(id)
    const token = String(result.access_token || result.token || '')
    const loginUrl = String(result.login_url || '').replace(/\/+$/, '')
    const target = loginUrl
      ? `${loginUrl}/login?token=${encodeURIComponent(token)}`
      : `${window.location.origin}/login?token=${encodeURIComponent(token)}`
    window.open(target, '_blank', 'noopener,noreferrer')
  }

  function setFilters(newFilters: Partial<SchoolFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
  }

  return { schools, selectedSchool, stats, isLoading, total, filters, fetchSchools, fetchSchool, suspendSchool, activateSchool, loginAsSchool, setFilters }
})
