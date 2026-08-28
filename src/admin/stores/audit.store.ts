import { ref } from 'vue'
import { defineStore } from 'pinia'
import { auditApi, type AuditEntry } from '@admin/services/auditApi'

export const useAuditStore = defineStore('adminAudit', () => {
  const logs = ref<AuditEntry[]>([])
  const total = ref(0)
  const isLoading = ref(false)

  const fetchLogs = async (filters: { page?: number; limit?: number; query?: string; action?: string; targetType?: string } = {}) => {
    isLoading.value = true
    try {
      const response = await auditApi.list(filters)
      logs.value = response.data
      total.value = response.pagination.total
    } finally {
      isLoading.value = false
    }
  }

  return { logs, total, isLoading, fetchLogs }
})