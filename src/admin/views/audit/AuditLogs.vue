<template>
  <AdminFeaturePage
    title="Audit Log"
    description="Review sensitive admin actions, exports, role changes, and platform operations history."
  >
    <AdminDataTable
      :columns="columns"
      :rows="store.logs"
      :filters="filterOptions"
      :searchFields="['action', 'ip_address']"
      search-placeholder="Search action or IP address..."
    >
      <template #column-admin_user="{ row }">
        <div class="min-w-0">
          <p class="font-semibold text-slate-900">{{ actorName(row) }}</p>
          <p class="truncate text-xs text-slate-500">{{ row.admin_user?.email ?? '—' }}</p>
        </div>
      </template>
      <template #column-action="{ row }">
        <div class="min-w-0">
          <p class="text-sm font-medium text-slate-900">{{ actionLabel(String(row.action)) }}</p>
          <p class="font-mono text-[10px] uppercase tracking-wide text-slate-400">{{ row.action }}</p>
        </div>
      </template>
      <template #column-target_type="{ row }">
        <span class="text-xs uppercase tracking-wide text-slate-600">{{ humanize(String(row.target_type)) }}</span>
      </template>
      <template #column-target_school="{ row }">
        <span class="text-sm text-slate-700">{{ row.target_school?.name ?? '—' }}</span>
      </template>
      <template #column-ip_address="{ row }">
        <span class="font-mono text-xs text-slate-600">{{ row.ip_address || '—' }}</span>
      </template>
      <template #column-created_at="{ row }">
        <div class="whitespace-nowrap text-sm text-slate-700">
          {{ formatDate(row.created_at) }}
        </div>
      </template>
    </AdminDataTable>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { useAuditStore } from '@admin/stores/audit.store'

const store = useAuditStore()

const ACTION_LABELS: Record<string, string> = {
  admin_logged_in: 'Admin logged in',
  school_status_updated: 'School status updated',
  school_admin_impersonation_created: 'School admin impersonation created',
  school_notes_updated: 'School notes updated',
  support_ticket_replied: 'Support ticket replied',
  platform_announcement_sent: 'Platform announcement sent',
  school_subscription_cancelled: 'School subscription cancelled',
  admin_user_invited: 'Admin user invited',
  admin_user_deleted: 'Admin user deleted',
  maintenance_enabled: 'Maintenance enabled',
  maintenance_disabled: 'Maintenance disabled',
  maintenance_scheduled: 'Maintenance scheduled',
  maintenance_notification_sent: 'Maintenance notification sent',
  platform_settings_updated: 'Platform settings updated',
  platform_feature_flag_updated: 'Platform feature flag updated',
  manual_payment_approved: 'Manual payment approved',
  manual_payment_rejected: 'Manual payment rejected',
  tester_access_activated: 'Tester access activated',
}

const columns = [
  { key: 'admin_user', label: 'Actor', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'target_type', label: 'Target Type', sortable: true },
  { key: 'target_school', label: 'School', sortable: true },
  { key: 'ip_address', label: 'IP Address', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
]

const filterOptions = computed(() => [
  {
    key: 'action',
    label: 'Action',
    options: Array.from(new Set(store.logs.map((entry) => String(entry.action)))).sort(),
  },
  {
    key: 'target_type',
    label: 'Target Type',
    options: Array.from(new Set(store.logs.map((entry) => String(entry.target_type)))).sort(),
  },
])

const actionLabel = (value: string) => ACTION_LABELS[value] ?? humanize(value)

const humanize = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const actorName = (row: Record<string, unknown>) => {
  const admin = row.admin_user as Record<string, unknown> | null | undefined
  return String(admin?.name ?? 'System')
}

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(() => {
  store.fetchLogs({ limit: 100 })
})
</script>