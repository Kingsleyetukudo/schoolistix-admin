<template>
  <AdminPanelCard title="Health Overview" description="API, database, queue, and maintenance signals for the platform.">
    <ul class="space-y-3 text-sm">
      <li class="flex items-center justify-between border-b border-black/10 pb-2">
        <span class="text-slate-500">API</span>
        <StatusPill :status="String(health.status ?? 'unknown')" />
      </li>
      <li class="flex items-center justify-between border-b border-black/10 pb-2">
        <span class="text-slate-500">Database</span>
        <StatusPill :status="String(health.database ?? 'unknown')" />
      </li>
      <li class="flex items-center justify-between border-b border-black/10 pb-2">
        <span class="text-slate-500">Queue</span>
        <StatusPill :status="String(health.queue ?? 'unknown')" />
      </li>
      <li class="flex items-center justify-between">
        <span class="text-slate-500">Maintenance</span>
        <StatusPill :status="health.maintenance ? 'active' : 'off'" />
      </li>
    </ul>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'

defineProps<{ health: Record<string, unknown> }>()

const StatusPill = defineComponent({
  name: 'StatusPill',
  props: { status: { type: String, default: 'unknown' } },
  setup(props) {
    return () => h(AdminStatusBadge, { status: props.status })
  },
})
</script>