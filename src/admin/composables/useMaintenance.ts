import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMaintenanceStore } from '@admin/stores/maintenance.store'

export function useMaintenance() {
  const store = useMaintenanceStore()
  const { status, history, isLoading } = storeToRefs(store)

  onMounted(() => {
    if (history.value.length === 0) {
      store.fetchStatus()
    }
  })

  return { status, history, isLoading, refresh: store.fetchStatus }
}