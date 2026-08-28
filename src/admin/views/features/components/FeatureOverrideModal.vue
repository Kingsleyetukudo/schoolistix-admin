<template>
  <AdminPanelCard
    title="Grant Tester Access"
    description="Manually grant a school full-feature tester access without waiting for a gateway payment."
  >
    <div
      v-if="notice"
      class="mb-3 rounded-xl border px-4 py-3 text-sm font-medium"
      :class="
        noticeType === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      "
    >
      {{ notice }}
    </div>

    <div class="space-y-3">
      <SearchableDropdownSelect
        label="School"
        :model-value="schoolId"
        :options="schoolOptions"
        placeholder="Select a school…"
        @change="schoolId = $event"
      />

      <div class="grid grid-cols-2 gap-3">
        <SearchableDropdownSelect
          label="Plan"
          :model-value="plan"
          :options="planOptions"
          full-width
          @change="plan = $event"
        />
        <SearchableDropdownSelect
          label="Duration"
          :model-value="String(durationDays)"
          :options="durationOptions"
          full-width
          @change="durationDays = Number($event)"
        />
      </div>

      <button
        type="button"
        class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="!schoolId || isSaving"
        @click="grantAccess"
      >
        {{ isSaving ? 'Granting…' : 'Grant Tester Access' }}
      </button>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { schoolsApi } from '@admin/services/schoolsApi'

const schools = ref<Array<Record<string, unknown>>>([])
const schoolId = ref('')
const schoolOptions = computed(() =>
  schools.value.map((school) => ({
    label: `${String(school.name)} (${String(school.plan ?? 'free')})`,
    value: String(school.id),
  })),
)

const planOptions = [
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
]

const durationOptions = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
]

const plan = ref('professional')
const durationDays = ref(30)
const isSaving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

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

const loadSchools = async () => {
  try {
    const response = await schoolsApi.list({ limit: 100 })
    schools.value = response.data
  } catch {
    showNotice('Unable to load schools.', 'error')
  }
}

const grantAccess = async () => {
  if (!schoolId.value || isSaving.value) return
  const selected = schools.value.find((school) => school.id === schoolId.value)
  isSaving.value = true
  try {
    await schoolsApi.activateTester(schoolId.value, {
      plan: plan.value,
      durationDays: Number(durationDays.value),
    })
    showNotice(
      `Tester access granted to ${String(selected?.name ?? 'school')} (${plan.value.toUpperCase()}, ${durationDays.value} days).`,
      'success',
    )
    schoolId.value = ''
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(loadSchools)
</script>
