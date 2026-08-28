<template>
  <AdminFeaturePage
    title="Admin Users"
    description="Manage internal platform operators, role assignments, and access posture."
  >
    <template #actions>
      <button
        type="button"
        class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
        @click="loadUsers"
      >
        Refresh
      </button>
    </template>

    <div
      v-if="notice"
      class="mb-4 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="
        noticeType === 'success'
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
          : 'border-rose-300 bg-rose-50 text-rose-800'
      "
    >
      {{ notice }}
    </div>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <AdminDataTable
        :columns="columns"
        :rows="rows"
        :filters="filterOptions"
        :searchFields="['name', 'email']"
        search-placeholder="Search by name or email..."
        :hasActions="true"
      >
        <template #column-name="{ row }">
          <p class="font-semibold text-slate-900">{{ row.name }}</p>
        </template>
        <template #column-role="{ row }">
          <AdminRoleBadge :role="String(row.role)" />
        </template>
        <template #column-status="{ row }">
          <AdminStatusBadge :status="String(row.status)" />
        </template>
        <template #column-lastLoginAt="{ row }">
          <span class="text-sm text-slate-600">{{ formatDate(row.lastLoginAt) }}</span>
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="rounded-lg border border-rose-700 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
            @click="openDelete(row)"
          >
            Remove
          </button>
        </template>
      </AdminDataTable>
      <InviteAdminModal @invited="loadUsers" />
    </div>

    <AdminConfirmModal
      :open="deleteOpen"
      title="Remove admin user?"
      :description="deleteDescription"
      @cancel="deleteOpen = false"
      @confirm="confirmDelete"
    />
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminConfirmModal from '@admin/components/common/AdminConfirmModal.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import { usersApi } from '@admin/services/usersApi'
import AdminRoleBadge from './components/AdminRoleBadge.vue'
import InviteAdminModal from './components/InviteAdminModal.vue'

const rows = ref<Array<Record<string, unknown>>>([])
const deleteOpen = ref(false)
const pendingUser = ref<Record<string, unknown> | null>(null)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastLoginAt', label: 'Last Login', sortable: true },
]

const filterOptions = computed(() => [
  {
    key: 'role',
    label: 'Role',
    options: Array.from(new Set(rows.value.map((user) => String(user.role)))).sort(),
  },
  {
    key: 'status',
    label: 'Status',
    options: Array.from(new Set(rows.value.map((user) => String(user.status ?? 'active')))).sort(),
  },
])

const deleteDescription = computed(() => {
  const user = pendingUser.value
  return user
    ? `Remove ${String(user.name ?? user.email ?? 'this admin')} from the admin console? This cannot be undone.`
    : ''
})

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const showNotice = (message: string, type: 'success' | 'error') => {
  notice.value = message
  noticeType.value = type
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

const loadUsers = async () => {
  try {
    rows.value = await usersApi.list()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  }
}

const openDelete = (row: Record<string, unknown>) => {
  pendingUser.value = row
  deleteOpen.value = true
}

const confirmDelete = async () => {
  const user = pendingUser.value
  if (!user) return
  deleteOpen.value = false
  try {
    await usersApi.remove(String(user.id))
    showNotice(`${String(user.name ?? user.email ?? 'Admin')} removed.`, 'success')
    await loadUsers()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    pendingUser.value = null
  }
}

onMounted(loadUsers)
</script>