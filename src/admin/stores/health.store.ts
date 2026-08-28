import { ref } from 'vue'
import { defineStore } from 'pinia'
import { healthApi } from '@admin/services/healthApi'

export const useHealthStore = defineStore('adminHealth', () => {
  const overview = ref<Record<string, unknown>>({})
  const isLoading = ref(false)

  const fetchOverview = async () => {
    isLoading.value = true
    try {
      overview.value = await healthApi.overview()
    } finally {
      isLoading.value = false
    }
  }

  return { overview, isLoading, fetchOverview }
})