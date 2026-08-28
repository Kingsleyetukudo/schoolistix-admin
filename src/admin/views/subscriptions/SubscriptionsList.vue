<template>
  <AdminFeaturePage
    title="Subscriptions"
    description="Review plan adoption, renewal status, and subscription health across all schools."
  >
    <AdminDataTable
      :columns="columns"
      :rows="store.subscriptions"
      :filters="filterOptions"
      :searchFields="['school_name', 'admin_email']"
      search-placeholder="Search by school or billing email..."
      :hasActions="true"
    >
      <template #column-school_name="{ row }">
        <div class="min-w-0">
          <p class="font-semibold text-slate-900">{{ row.school_name }}</p>
          <p class="truncate text-xs text-slate-500">{{ row.admin_email ?? '—' }}</p>
        </div>
      </template>
      <template #column-plan="{ row }">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-700">
          {{ row.plan_name ?? row.plan }}
        </span>
      </template>
      <template #column-amount="{ row }">
        <span class="font-semibold text-slate-900">{{ formatAmount(row) }}</span>
      </template>
      <template #column-status="{ row }">
        <AdminStatusBadge :status="String(row.status)" />
      </template>
      <template #column-next_billing_at="{ row }">
        <span class="text-sm text-slate-600">{{ formatDate(row.next_billing_at) }}</span>
      </template>
      <template #actions="{ row }">
        <RouterLink
          class="rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
          :to="`/admin/subscriptions/${row.school_id}`"
        >
          View
        </RouterLink>
      </template>
    </AdminDataTable>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import { useSubscriptionsStore } from '@admin/stores/subscriptions.store'
import type { AdminSubscription } from '@admin/services/subscriptionsApi'

const store = useSubscriptionsStore()

const columns = [
  { key: 'school_name', label: 'School', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'next_billing_at', label: 'Next Billing', sortable: true },
]

const filterOptions = computed(() => [
  {
    key: 'status',
    label: 'Status',
    options: Array.from(new Set(store.subscriptions.map((sub) => String(sub.status)))).sort(),
  },
  {
    key: 'plan',
    label: 'Plan',
    options: Array.from(new Set(store.subscriptions.map((sub) => String(sub.plan ?? 'free')))).sort(),
  },
])

const formatAmount = (row: AdminSubscription) => {
  const amount = Number(row.amount ?? 0)
  const currency = String(row.currency ?? 'NGN')
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(() => {
  store.fetchSubscriptions()
})
</script>