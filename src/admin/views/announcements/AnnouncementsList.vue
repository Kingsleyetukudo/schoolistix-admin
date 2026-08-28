<template>
  <AdminFeaturePage
    title="Announcements"
    description="Broadcast platform-wide updates and targeted communications to school operators."
  >
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <AdminDataTable
        :columns="columns"
        :rows="announcements"
        :filters="filterOptions"
        :searchFields="['title', 'content']"
        search-placeholder="Search announcements..."
      >
        <template #column-title="{ row }">
          <div class="min-w-0">
            <p class="font-semibold text-slate-900">{{ row.title }}</p>
            <p class="line-clamp-1 truncate text-xs text-slate-500">{{ row.content }}</p>
          </div>
        </template>
        <template #column-target_audience="{ row }">
          <span class="rounded-lg border border-black/20 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {{ formatAudience(row.target_audience) }}
          </span>
        </template>
        <template #column-status="{ row }">
          <AdminStatusBadge :status="String(row.status)" />
        </template>
        <template #column-sent_at="{ row }">
          <span class="text-sm text-slate-600">{{ formatDate(row.sent_at ?? row.created_at) }}</span>
        </template>
      </AdminDataTable>
      <CreateAnnouncement @created="loadAnnouncements" />
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import { announcementsApi } from '@admin/services/announcementsApi'
import CreateAnnouncement from './components/CreateAnnouncement.vue'

const announcements = ref<Array<Record<string, unknown>>>([])

const columns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'target_audience', label: 'Audience', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'sent_at', label: 'Sent At', sortable: true },
]

const filterOptions = computed(() => [
  {
    key: 'status',
    label: 'Status',
    options: Array.from(new Set(announcements.value.map((item) => String(item.status)))).sort(),
  },
  {
    key: 'target_audience',
    label: 'Audience',
    options: Array.from(new Set(announcements.value.map((item) => String(item.target_audience)))).sort(),
  },
])

const formatAudience = (value: unknown) => String(value ?? 'all').replace(/_/g, ' ')

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const loadAnnouncements = async () => {
  try {
    announcements.value = await announcementsApi.list()
  } catch {
    announcements.value = []
  }
}

onMounted(loadAnnouncements)
</script>