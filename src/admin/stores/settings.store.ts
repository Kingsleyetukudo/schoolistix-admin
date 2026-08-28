import { ref } from 'vue'
import { defineStore } from 'pinia'
import { settingsApi } from '@admin/services/settingsApi'

export const useSettingsStore = defineStore('adminSettings', () => {
  const settings = ref<Record<string, unknown>>({})
  const isLoading = ref(false)

  const fetchSettings = async () => {
    isLoading.value = true
    try {
      settings.value = await settingsApi.get()
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async (payload: Record<string, unknown>) => {
    const result = await settingsApi.save(payload)
    settings.value = result
    return result
  }

  return { settings, isLoading, fetchSettings, saveSettings }
})