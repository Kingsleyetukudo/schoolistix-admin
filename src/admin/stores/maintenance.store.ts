import { ref } from 'vue'
import { defineStore } from 'pinia'
import { maintenanceApi } from '@admin/services/maintenanceApi'

export const useMaintenanceStore = defineStore('adminMaintenance', () => {
  const status = ref<Record<string, unknown>>({})
  const history = ref<Array<Record<string, unknown>>>([])
  const isLoading = ref(false)

  const fetchStatus = async () => {
    isLoading.value = true
    try {
      const [statusResult, historyResult] = await Promise.all([
        maintenanceApi.getStatus(),
        maintenanceApi.getHistory(),
      ])
      status.value = statusResult
      history.value = Array.isArray(historyResult.data)
      ? (historyResult.data as Array<Record<string, unknown>>)
      : []
    } finally {
      isLoading.value = false
    }
  }

  const enable = async (payload: { message?: string; eta?: string; reason?: string }) => {
    const result = await maintenanceApi.enable(payload)
    await fetchStatus()
    return result
  }

  const disable = async (payload: { notes?: string } = {}) => {
    const result = await maintenanceApi.disable(payload)
    await fetchStatus()
    return result
  }

  const schedule = async (payload: { startsAt?: string; endsAt?: string; message?: string; reason?: string }) => {
    const result = await maintenanceApi.schedule(payload)
    await fetchStatus()
    return result
  }

  return { status, history, isLoading, fetchStatus, enable, disable, schedule }
})