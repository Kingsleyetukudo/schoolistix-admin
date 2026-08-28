<template>
  <AdminFeaturePage
    title="Maintenance"
    description="Control maintenance mode, scheduled windows, and bypass access for internal teams."
  >
    <div class="grid gap-4 xl:grid-cols-2">
      <MaintenanceToggle :settings="settings" @changed="reload" />
      <ScheduleMaintenance :settings="settings" @changed="reload" />
      <BypassSettings :settings="settings" />
      <MaintenanceHistory :history="history" />
    </div>
    <p v-if="isLoading" class="mt-4 text-sm text-slate-500">Loading maintenance settings…</p>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { maintenanceApi } from '@admin/services/maintenanceApi'
import BypassSettings from './components/BypassSettings.vue'
import MaintenanceHistory from './components/MaintenanceHistory.vue'
import MaintenanceToggle from './components/MaintenanceToggle.vue'
import ScheduleMaintenance from './components/ScheduleMaintenance.vue'

const settings = ref<Record<string, unknown>>({})
const history = ref<Array<Record<string, unknown>>>([])
const isLoading = ref(false)

const reload = async () => {
  isLoading.value = true
  try {
    settings.value = await maintenanceApi.getStatus()
    const historyResponse = await maintenanceApi.getHistory()
    history.value = Array.isArray(historyResponse.data)
      ? (historyResponse.data as Array<Record<string, unknown>>)
      : []
  } finally {
    isLoading.value = false
  }
}

onMounted(reload)
</script>