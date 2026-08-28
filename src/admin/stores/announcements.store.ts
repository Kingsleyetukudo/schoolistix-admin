import { ref } from 'vue'
import { defineStore } from 'pinia'
import { announcementsApi } from '@admin/services/announcementsApi'

export const useAnnouncementsStore = defineStore('adminAnnouncements', () => {
  const announcements = ref<Array<Record<string, unknown>>>([])
  const isLoading = ref(false)

  const fetchAnnouncements = async () => {
    isLoading.value = true
    try {
      announcements.value = await announcementsApi.list()
    } finally {
      isLoading.value = false
    }
  }

  return { announcements, isLoading, fetchAnnouncements }
})