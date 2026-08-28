import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BackupRecord } from '@admin/types/backup.types'
import { backupsApi } from '@admin/services/backupsApi'

export const useBackupsStore = defineStore('adminBackups', () => {
  const backups = ref<BackupRecord[]>([])
  const isLoading = ref(false)

  const fetchBackups = async () => {
    isLoading.value = true
    try {
      backups.value = await backupsApi.list()
    } finally {
      isLoading.value = false
    }
  }

  return { backups, isLoading, fetchBackups }
})
