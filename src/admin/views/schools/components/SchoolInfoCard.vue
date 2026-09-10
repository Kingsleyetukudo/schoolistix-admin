<template>
  <AdminPanelCard title="School Profile" description="Tenant identity, contact, location, sections, plan, and registration context.">
    <dl class="grid gap-3 text-sm text-slate-700">
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Name</dt>
        <dd class="font-semibold text-slate-900">{{ school?.name ?? '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Abbreviation</dt>
        <dd class="font-semibold text-slate-900">{{ school?.short_code || '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Subdomain</dt>
        <dd>{{ school?.subdomain ?? '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Phone</dt>
        <dd>{{ school?.phone || '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">State</dt>
        <dd>{{ school?.state || '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Country</dt>
        <dd>{{ school?.country || '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Sections</dt>
        <dd class="text-right">{{ sectionsLabel }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Admin</dt>
        <dd class="font-semibold text-slate-900">{{ adminNames }}</dd>
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
import { computed } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import type { School } from '@admin/types/school.types'

const props = defineProps<{ school: School | null }>()

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const sectionsLabel = computed(() => {
  const sections = props.school?.sections
  if (!Array.isArray(sections) || sections.length === 0) return '—'
  return sections
    .map((entry) => (typeof entry === 'string' ? entry : entry?.label || entry?.code || entry))
    .join(', ')
})

const adminNames = computed(() => {
  const users = props.school?.users
  if (!Array.isArray(users) || users.length === 0) return '—'
  const admins = users.filter((user) => ['Owner', 'Admin'].includes(String(user?.role ?? '')))
  const source = admins.length ? admins : users
  const names = source.map((user) => user?.name || '').filter(Boolean)
  return names.length ? names.join(', ') : '—'
})
</script>
