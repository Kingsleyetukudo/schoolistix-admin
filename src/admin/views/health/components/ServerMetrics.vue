<template>
  <AdminPanelCard title="Server Metrics" description="Uptime, readiness, and overall status from the health endpoint.">
    <ul class="space-y-3 text-sm">
      <li class="flex items-center justify-between border-b border-black/10 pb-2">
        <span class="text-slate-500">Uptime</span>
        <span class="font-semibold text-slate-900">{{ formatUptime(health.uptime_seconds) }}</span>
      </li>
      <li class="flex items-center justify-between border-b border-black/10 pb-2">
        <span class="text-slate-500">Readiness</span>
        <span class="font-semibold text-slate-900">{{ String(health.readiness ?? 'unknown').toUpperCase() }}</span>
      </li>
      <li class="flex items-center justify-between">
        <span class="text-slate-500">Overall Status</span>
        <span class="font-semibold text-slate-900">{{ String(health.status ?? 'unknown').toUpperCase() }}</span>
      </li>
    </ul>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'

defineProps<{ health: Record<string, unknown> }>()

const formatUptime = (value: unknown) => {
  const seconds = Number(value ?? 0)
  if (!seconds) return '—'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}
</script>