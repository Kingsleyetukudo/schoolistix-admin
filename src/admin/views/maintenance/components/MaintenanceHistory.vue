<template>
  <AdminPanelCard title="Maintenance History" description="Timeline of scheduled and completed maintenance operations across the platform.">
    <ul v-if="history.length" class="space-y-3 text-sm text-slate-700">
      <li
        v-for="entry in history"
        :key="String(entry.id ?? entry.started_at ?? entry.created_at ?? '')"
        class="rounded-lg border border-black bg-white px-4 py-3"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold text-slate-900">{{ entry.reason ?? entry.message ?? 'Maintenance' }}</p>
          <AdminStatusBadge :status="String(entry.status ?? entry.state ?? 'scheduled')" />
        </div>
        <p class="mt-1 text-xs text-slate-500">
          {{ formatWindow(entry) }}
        </p>
      </li>
    </ul>
    <p v-else class="rounded-lg border border-black/20 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      No maintenance history yet.
    </p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'

defineProps<{ history: Array<Record<string, unknown>> }>()
const formatDate = (value: unknown) => {
  if (!value) return ''
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const formatWindow = (entry: Record<string, unknown>) => {
  const start = entry.started_at ?? entry.scheduled_start
  const end = entry.ended_at ?? entry.scheduled_end
  const pieces = [start ? formatDate(start) : '', end ? `→ ${formatDate(end)}` : '']
  return pieces.filter(Boolean).join(' ') || '—'
}
</script>