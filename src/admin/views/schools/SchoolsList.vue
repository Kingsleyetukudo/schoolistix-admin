<template>
  <AdminFeaturePage
    title="Schools"
    description="Search, filter, suspend, activate, and grant tester access to tenant schools across the platform."
  >
    <AdminDataTable
      :columns="columns"
      :rows="store.schools"
      :filters="filterOptions"
      :hasActions="true"
      :searchFields="['name', 'subdomain']"
      search-placeholder="Search by school name or subdomain..."
      @view="openTesterModal"
    >
      <template #column-name="{ row }">
        <div class="min-w-0">
          <p class="font-semibold text-slate-900">{{ row.name }}</p>
          <p class="truncate text-xs text-slate-500">{{ row.subdomain }}</p>
        </div>
      </template>
      <template #column-plan="{ row }">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-700">{{ row.plan }}</span>
      </template>
      <template #column-status="{ row }">
        <AdminStatusBadge :status="String(row.status)" />
      </template>
      <template #column-createdAt="{ row }">
        <span class="text-sm text-slate-600">{{ formatDate(row.createdAt) }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap items-center gap-2">
          <RouterLink
            class="rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-slate-100"
            :to="`/admin/schools/${row.id}`"
          >
            View
          </RouterLink>
          <button
            type="button"
            class="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            @click="openTesterModal(row)"
          >
            Tester Access
          </button>
        </div>
      </template>
    </AdminDataTable>

    <div
      v-if="testerOpen"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
      @click.self="closeTesterModal"
    >
      <div class="w-full max-w-md rounded-xl border border-black bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-slate-900">Grant tester access</h3>
        <p class="mt-2 text-sm text-slate-600">
          Activate full-feature access for
          <span class="font-semibold text-slate-900">{{ selectedSchool?.name }}</span> without a
          gateway payment.
        </p>
        <div
          v-if="notice"
          class="mt-3 rounded-lg border px-4 py-3 text-sm font-medium"
          :class="noticeClass"
        >
          {{ notice }}
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <SearchableDropdownSelect
            label="Plan"
            :model-value="plan"
            :options="planOptions"
            @change="plan = $event"
          />
          <SearchableDropdownSelect
            label="Duration"
            :model-value="String(durationDays)"
            :options="durationOptions"
            @change="durationDays = Number($event)"
          />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="closeTesterModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            :disabled="isSaving"
            @click="confirmTester"
          >
            {{ isSaving ? 'Granting…' : 'Grant Access' }}
          </button>
        </div>
      </div>
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { useSchoolsStore } from '@admin/stores/schools.store'
import { schoolsApi } from '@admin/services/schoolsApi'

const store = useSchoolsStore()

const columns = [
  { key: 'name', label: 'School', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'students', label: 'Students', sortable: true },
  { key: 'createdAt', label: 'Registered', sortable: true },
]

const filterOptions = computed(() => [
  {
    key: 'status',
    label: 'Status',
    options: Array.from(new Set(store.schools.map((school) => String(school.status)))).sort(),
  },
  {
    key: 'plan',
    label: 'Plan',
    options: Array.from(new Set(store.schools.map((school) => String(school.plan ?? 'free')))).sort(),
  },
])

const planOptions = [
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
]

const durationOptions = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
]

const testerOpen = ref(false)
const selectedSchool = ref<Record<string, unknown> | null>(null)
const plan = ref('professional')
const durationDays = ref(30)
const isSaving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const noticeClass = computed(() =>
  noticeType.value === 'success'
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
    : 'border-rose-300 bg-rose-50 text-rose-800',
)

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

const openTesterModal = (row: Record<string, unknown>) => {
  selectedSchool.value = row
  notice.value = ''
  plan.value = 'professional'
  durationDays.value = 30
  testerOpen.value = true
}

const closeTesterModal = () => {
  testerOpen.value = false
  selectedSchool.value = null
  notice.value = ''
}

const confirmTester = async () => {
  const school = selectedSchool.value
  if (!school || isSaving.value) return
  isSaving.value = true
  try {
    await schoolsApi.activateTester(String(school.id), {
      plan: plan.value,
      durationDays: Number(durationDays.value),
    })
    notice.value = `${String(school.name)} now has full ${plan.value.toUpperCase()} access.`
    noticeType.value = 'success'
    await store.fetchSchools()
    setTimeout(closeTesterModal, 1200)
  } catch (error) {
    notice.value = errorMessage(error)
    noticeType.value = 'error'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  store.fetchSchools()
})
</script>