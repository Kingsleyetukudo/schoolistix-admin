<template>
  <AdminPanelCard title="Create Announcement" description="Draft a platform announcement and choose the target audience.">
    <div
      v-if="notice"
      class="mb-3 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="noticeType === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'"
    >
      {{ notice }}
    </div>

    <form class="space-y-3" @submit.prevent="submit">
      <input
        v-model="title"
        type="text"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
        placeholder="Announcement title"
        required
      />
      <SearchableDropdownSelect
        label="Audience"
        :model-value="audience"
        :options="audienceOptions"
        @change="audience = $event"
      />
      <div v-if="audience === 'specific_plan'" class="space-y-3">
        <SearchableDropdownSelect
          label="Target plan"
          :model-value="targetPlan"
          :options="planOptions"
          @change="targetPlan = $event"
        />
      </div>
      <div v-if="audience === 'specific_schools'" class="space-y-3">
        <SearchableDropdownSelect
          label="Target school"
          :model-value="targetSchoolId"
          :options="schoolOptions"
          placeholder="Select a school…"
          @change="targetSchoolId = $event"
        />
      </div>
      <textarea
        v-model="content"
        rows="4"
        class="min-h-28 w-full rounded-lg border border-black bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
        placeholder="Write the message..."
        required
      ></textarea>
      <button
        type="submit"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Sending…' : 'Send Announcement' }}
      </button>
    </form>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { announcementsApi } from '@admin/services/announcementsApi'
import { schoolsApi } from '@admin/services/schoolsApi'

const emit = defineEmits<{ (e: 'created'): void }>()

const title = ref('')
const content = ref('')
const audience = ref('all')
const targetPlan = ref('')
const targetSchoolId = ref('')
const isSaving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')
const schools = ref<Array<Record<string, unknown>>>([])

const audienceOptions = [
  { label: 'All schools', value: 'all' },
  { label: 'Specific plan', value: 'specific_plan' },
  { label: 'Specific schools', value: 'specific_schools' },
]

const planOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
]

const schoolOptions = computed(() =>
  schools.value.map((school) => ({
    label: `${String(school.name)} (${String(school.subdomain ?? '')})`,
    value: String(school.id),
  })),
)

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
    schools.value = []
  }
}

const submit = async () => {
  if (isSaving.value) return
  if (audience.value === 'specific_plan' && !targetPlan.value) {
    showNotice('Select a target plan for plan-specific announcements.', 'error')
    return
  }
  if (audience.value === 'specific_schools' && !targetSchoolId.value) {
    showNotice('Select a target school for school-specific announcements.', 'error')
    return
  }
  isSaving.value = true
  try {
    await announcementsApi.create({
      title: title.value.trim(),
      content: content.value.trim(),
      targetAudience: audience.value,
      targetPlan: audience.value === 'specific_plan' ? targetPlan.value : '',
      targetSchoolIds: audience.value === 'specific_schools' ? [targetSchoolId.value] : [],
    })
    showNotice('Announcement sent.', 'success')
    title.value = ''
    content.value = ''
    audience.value = 'all'
    targetPlan.value = ''
    targetSchoolId.value = ''
    emit('created')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(loadSchools)
</script>