<template>
  <AdminPanelCard title="School Profile" description="Tenant identity, plan, status, and registration context.">
    <dl class="grid gap-3 text-sm text-slate-700">
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Name</dt>
        <dd class="font-semibold text-slate-900">{{ school?.name ?? '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Subdomain</dt>
        <dd>{{ school?.subdomain ?? '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Admin email</dt>
        <dd>{{ school?.admin_email ?? '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Plan</dt>
        <dd class="font-semibold text-slate-900">{{ String(school?.plan ?? 'free').toUpperCase() }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Status</dt>
        <dd><AdminStatusBadge :status="String(school?.status ?? '')" /></dd>
      </div>
      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Registered</dt>
        <dd>{{ formatDate(school?.createdAt ?? school?.registered_at) }}</dd>
      </div>
    </dl>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import type { School } from '@admin/types/school.types'

defineProps<{ school: School | null }>()

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
</script>