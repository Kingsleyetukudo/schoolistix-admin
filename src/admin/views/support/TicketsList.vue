<template>
  <AdminFeaturePage :title="pageTitle" :description="pageDescription">
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-lg border border-black bg-white p-1">
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm font-semibold transition"
          :class="activeTab === 'ticket' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'"
          @click="switchTab('ticket')"
        >
          Tickets
        </button>
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm font-semibold transition"
          :class="activeTab === 'chat' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'"
          @click="switchTab('chat')"
        >
          Live Chat
        </button>
      </div>

      <div
        v-if="store.connectionState === 'live'"
        class="inline-flex items-center gap-2 rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
      >
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        Live updates connected
      </div>
    </div>

    <AdminDataTable
      :columns="columns"
      :rows="visibleTickets"
      :filters="filterOptions"
      :searchFields="searchFields"
      :search-placeholder="searchPlaceholder"
      :hasActions="true"
      @view="openTicket"
    >
      <template v-if="activeTab === 'ticket'" #column-subject="{ row }">
        <div class="min-w-0">
          <p class="font-semibold text-slate-900">{{ row.subject }}</p>
          <p class="truncate text-xs text-slate-500">
            {{ row.replyCount }} repl{{ row.replyCount === 1 ? 'y' : 'ies' }} ·
            {{ row.unreadForAdmin ? 'unread' : 'read' }}
          </p>
        </div>
      </template>
      <template v-else #column-message="{ row }">
        <div class="min-w-0">
          <p class="truncate font-medium text-slate-900">
            {{ row.message || row.subject || 'Live chat' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ row.replyCount }} repl{{ row.replyCount === 1 ? 'y' : 'ies' }} ·
            {{ row.unreadForAdmin ? 'unread' : 'read' }}
          </p>
        </div>
      </template>
      <template #column-schoolName="{ row }">
        <span class="text-sm text-slate-700">{{ row.schoolName || '—' }}</span>
      </template>
      <template v-if="activeTab === 'ticket'" #column-assignedTo="{ row }">
        <span class="text-sm text-slate-700">
          {{ row.assignedTo?.name ?? '—' }}
        </span>
      </template>
      <template v-if="activeTab === 'ticket'" #column-priority="{ row }">
        <AdminStatusBadge :status="String(row.priority)" />
      </template>
      <template v-if="activeTab === 'ticket'" #column-status="{ row }">
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import { useSupportStore } from '@admin/stores/support.store'

const store = useSupportStore()
const router = useRouter()

const activeTab = ref<'ticket' | 'chat'>('ticket')

const pageTitle = computed(() =>
  activeTab.value === 'chat' ? 'Live Chat' : 'Support Tickets',
)

const pageDescription = computed(() =>
  activeTab.value === 'chat'
    ? 'Real-time conversations from the Schoolistix live chat widget.'
    : 'Manage inbound school tickets, filter by status and priority, and keep response times within target.',
)

const columns = computed(() =>
  activeTab.value === 'chat'
    ? [
        { key: 'schoolName', label: 'School', sortable: true },
        { key: 'message', label: 'Message', sortable: false },
        { key: 'updatedAt', label: 'Last activity', sortable: true },
      ]
    : [
        { key: 'subject', label: 'Subject', sortable: true },
        { key: 'schoolName', label: 'School', sortable: true },
        { key: 'assignedTo', label: 'Assigned', sortable: false },
        { key: 'priority', label: 'Priority', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'updatedAt', label: 'Updated', sortable: true },
      ],
)

const filterOptions = computed(() => {
  if (activeTab.value === 'chat') return []

  return [
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
  ]
})

const searchFields = computed(() =>
  activeTab.value === 'chat' ? ['schoolName', 'message'] : ['subject', 'schoolName'],
)

const searchPlaceholder = computed(() =>
  activeTab.value === 'chat' ? 'Search by school or message...' : 'Search by subject or school...',
)

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const openTicket = (row: Record<string, unknown>) => {
  void router.push(`/admin/support/${String(row.id)}`)
}

const switchTab = (tab: 'ticket' | 'chat') => {
  if (activeTab.value === tab) return
  activeTab.value = tab
}

const visibleTickets = computed(() =>
  store.tickets.filter((ticket) => String(ticket.channel) === activeTab.value),
)

onMounted(() => {
  store.fetchTickets()
  store.connectStream()
})

onBeforeUnmount(() => {
  store.disconnectStream()
})
</script>