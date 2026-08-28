<template>
  <AdminFeaturePage
    title="System Health"
    description="Track platform availability, background workers, queue pressure, and recent incident context."
  >
    <div class="grid gap-4 xl:grid-cols-3">
      <HealthCard :health="store.overview" />
      <QueueMonitor :health="store.overview" />
      <ServerMetrics :health="store.overview" />
    </div>
    <div v-if="store.isLoading" class="mt-4 text-sm text-slate-500">Loading health data…</div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { useHealthStore } from '@admin/stores/health.store'
import HealthCard from './components/HealthCard.vue'
import QueueMonitor from './components/QueueMonitor.vue'
import ServerMetrics from './components/ServerMetrics.vue'

const store = useHealthStore()

onMounted(() => {
  store.fetchOverview()
})
</script>