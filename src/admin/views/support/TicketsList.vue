<template>
  <AdminFeaturePage
    title="Support Tickets"
    description="Manage inbound school tickets, filter by status and priority, and keep response times within target."
  >
    <div
      v-if="store.connectionState === 'live'"
      class="mb-4 inline-flex items-center gap-2 rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
    >
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      Live updates connected
    </div>

    <AdminDataTable
      :columns="columns"
      :rows="store.tickets"
      :filters="filterOptions"
      :searchFields="['subject', 'schoolName']"
      search-placeholder="Search by subject or school..."
      :hasActions="true"
      @view="openTicket"
    >
      <template #column-subject="{ row }">
        <div class="min-w-0">
          <p class="font-semibold text-slate-900">{{ row.subject }}</p>
          <p class="truncate text-xs text-slate-500">
            {{ row.replyCount }} repl{{ row.replyCount === 1 ? 'y' : 'ies' }} ·
            {{ row.unreadForAdmin ? 'unread' : 'read' }}
          </p>
        </div>
      </template>
      <template #column-schoolName="{ row }">
        <span class="text-sm text-slate-700">{{ row.schoolName || '—' }}</span>
      </template>
      <template #column-priority="{ row }">
        <AdminStatusBadge :status="String(row.priority)" />
      </template>
      <template #column-status="{ row }">
        <AdminStatusBadge :status="String(row.status)" />
      </template>
      <template #column-updatedAt="{ row }">
        <span class="text-sm text-slate-600">{{ formatDate(row.updatedAt) }}</span>
      </template>
      <template #actions="{ row }">
        <button
          type="button"
          class="rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
          @click="openTicket(row)"
        >
          View
        </button>
      </template>
    </AdminDataTable>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import { useSupportStore } from '@admin/stores/support.store'

const store = useSupportStore()
const router = useRouter()

const columns = [
  { key: 'subject', label: 'Subject', sortable: true },
  { key: 'schoolName', label: 'School', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true },
]

const filterOptions = computed(() => [
  {
    key: 'status',
    label: 'Status',
    options: Array.from(new Set(store.tickets.map((ticket) => String(ticket.status)))).sort(),
  },
  {
    key: 'priority',
    label: 'Priority',
    options: Array.from(new Set(store.tickets.map((ticket) => String(ticket.priority)))).sort(),
  },
])

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const openTicket = (row: Record<string, unknown>) => {
  void router.push(`/admin/support/${String(row.id)}`)
}

onMounted(() => {
  store.fetchTickets()
  store.connectStream()
})

onBeforeUnmount(() => {
  store.disconnectStream()
})
</script>