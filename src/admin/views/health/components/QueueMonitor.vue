<template>
  <AdminPanelCard title="Queue & Errors" description="Background worker queue state and recent error volume.">
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-lg border border-black bg-white p-4">
        <p class="text-xs text-slate-500">Queue</p>
        <p class="mt-2 text-lg font-bold text-slate-900">{{ String(health.queue ?? 'unknown').toUpperCase() }}</p>
      </div>
      <div class="rounded-lg border border-black bg-white p-4">
        <p class="text-xs text-slate-500">Recent Errors</p>
        <p class="mt-2 text-lg font-bold text-slate-900">{{ Number(health.recent_error_count ?? 0).toLocaleString() }}</p>
      </div>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'

defineProps<{ health: Record<string, unknown> }>()
</script>