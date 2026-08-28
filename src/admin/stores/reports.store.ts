import { ref } from 'vue'
import { defineStore } from 'pinia'
import { reportsApi, type ReportsOverview } from '@admin/services/reportsApi'

export const useReportsStore = defineStore('adminReports', () => {
  const overview = ref<ReportsOverview | null>(null)
  const isLoading = ref(false)

  const fetchDashboard = async () => {
    isLoading.value = true
    try {
      overview.value = await reportsApi.dashboard()
    } finally {
      isLoading.value = false
    }
  }

  return { overview, isLoading, fetchDashboard }
})