<template>
  <AdminFeaturePage
    title="AI Feedback & Audit"
    description="Review what schools report about AI replies and inspect the governance trail for AI gates, settings changes and feedback events."
  >
    <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-medium">
        <button
          v-for="option in tabOptions"
          :key="option.value"
          type="button"
          class="px-4 py-2 transition"
          :class="activeTab === option.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'"
          @click="switchTab(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-medium">
        <button
          v-for="days in rangeOptions"
          :key="days"
          type="button"
          class="px-3 py-2 transition"
          :class="rangeDays === days ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'"
          @click="setRange(days)"
        >
          {{ days }}d
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-4 text-sm text-slate-500">Loading AI feedback & audit data...</div>

    <template v-else>
      <section v-if="activeTab === 'feedback'" class="mt-4 space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Feedback received</p>
            <p class="mt-2 text-3xl font-bold text-slate-800">{{ feedbackSummary.total }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Helpful</p>
            <p class="mt-2 text-3xl font-bold text-emerald-600">{{ countByRating('helpful') }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Incorrect</p>
            <p class="mt-2 text-3xl font-bold text-red-600">{{ countByRating('incorrect') }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Unhelpful</p>
            <p class="mt-2 text-3xl font-bold text-amber-600">{{ countByRating('unhelpful') }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-medium text-slate-600">Feedback report</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="option in ratingOptions"
              :key="option.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
              :class="ratingFilter === option.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
              @click="setRating(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th class="px-5 py-3 font-medium">School</th>
                <th class="px-5 py-3 font-medium">Feature</th>
                <th class="px-5 py-3 font-medium">Rating</th>
                <th class="px-5 py-3 font-medium">Reason</th>
                <th class="px-5 py-3 font-medium">Comment</th>
                <th class="px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in feedbackRows" :key="row.id" class="border-b border-slate-50 align-top last:border-0">
                <td class="px-5 py-3 text-slate-800">{{ row.school?.name ?? row.schoolId }}</td>
                <td class="px-5 py-3 text-slate-600">{{ row.featureLabel || row.feature }}</td>
                <td class="px-5 py-3">
                  <span
                    class="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    :class="ratingBadgeClasses[row.rating] ?? 'border-slate-200 bg-slate-50 text-slate-600'"
                  >
                    {{ ratingLabels[row.rating] ?? row.rating }}
                  </span>
                </td>
                <td class="px-5 py-3 text-slate-600">{{ reasonLabels[row.reason ?? ''] ?? '—' }}</td>
                <td class="max-w-xs truncate px-5 py-3 text-slate-600" :title="row.comment ?? ''">
                  {{ row.comment || '—' }}
                </td>
                <td class="px-5 py-3 whitespace-nowrap text-xs text-slate-400">{{ formatDate(row.createdAt) }}</td>
              </tr>
              <tr v-if="!feedbackRows.length">
                <td class="px-5 py-8 text-center text-slate-400" colspan="6">No AI feedback in this period.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>

      <section v-else class="mt-4 space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Audit events</p>
            <p class="mt-2 text-3xl font-bold text-slate-800">{{ auditSummary.total }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Feature blocks</p>
            <p class="mt-2 text-3xl font-bold text-red-600">{{ auditCount('ai_feature_blocked') }}</p>
            <p class="mt-1 text-xs text-slate-400">Disabled / quota / denied</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Settings changes</p>
            <p class="mt-2 text-3xl font-bold text-slate-800">{{ governanceChanges }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Feedback events</p>
            <p class="mt-2 text-3xl font-bold text-slate-800">{{ feedbackEvents }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm font-medium text-slate-600">Audit events</p>
          <div class="flex items-center gap-2">
            <label for="audit-action-filter" class="text-xs font-medium text-slate-500">Action</label>
            <select
              id="audit-action-filter"
              v-model="actionFilter"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              @change="loadAudit()"
            >
              <option value="">All actions</option>
              <option v-for="action in auditActions" :key="action" :value="action">{{ actionLabel(action) }}</option>
            </select>
          </div>
        </div>

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th class="px-5 py-3 font-medium">Action</th>
                <th class="px-5 py-3 font-medium">School</th>
                <th class="px-5 py-3 font-medium">Actor</th>
                <th class="px-5 py-3 font-medium">Target</th>
                <th class="px-5 py-3 font-medium">Detail</th>
                <th class="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in auditRows" :key="row.id" class="border-b border-slate-50 align-top last:border-0">
                <td class="px-5 py-3">
                  <span
                    class="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    :class="actionBadgeClasses(row.action)"
                  >
                    {{ actionLabel(row.action) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-slate-800">{{ row.school?.name ?? '—' }}</td>
                <td class="px-5 py-3 text-slate-600">
                  {{ actorTypeLabels[row.actorType] ?? row.actorType }}
                  <span v-if="row.actorId" class="text-slate-400">· {{ maskId(row.actorId) }}</span>
                </td>
                <td class="px-5 py-3 text-slate-600">{{ row.target || '—' }}</td>
                <td class="max-w-xs px-5 py-3 text-xs text-slate-500" :title="auditDetail(row)">
                  {{ auditDetail(row) || '—' }}
                </td>
                <td class="px-5 py-3 whitespace-nowrap text-xs text-slate-400">{{ formatDate(row.createdAt) }}</td>
              </tr>
              <tr v-if="!auditRows.length">
                <td class="px-5 py-8 text-center text-slate-400" colspan="6">No AI audit events in this period.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>
    </template>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { aiApi, type AiAuditRow, type AiAuditResponse, type AiFeedbackResponse } from '@admin/services/aiApi'

type ConsoleTab = 'feedback' | 'audit'

const tabOptions: Array<{ value: ConsoleTab; label: string }> = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'audit', label: 'Audit trail' },
]
const rangeOptions = [7, 30, 90]

const ratingLabels: Record<string, string> = {
  helpful: 'Helpful',
  incorrect: 'Incorrect',
  unhelpful: 'Unhelpful',
}
const reasonLabels: Record<string, string> = {
  wrong_score: 'Wrong score',
  missing_context: 'Missing context',
  wrong_student: 'Wrong student',
  math_error: 'Math error',
  unclear: 'Unclear',
  other: 'Other',
}
const actionLabels: Record<string, string> = {
  ai_feature_blocked: 'Feature blocked',
  school_ai_settings_updated: 'School AI settings updated',
  ai_platform_settings_updated: 'Platform AI settings updated',
  ai_feedback_submitted: 'Feedback submitted',
}
const actorTypeLabels: Record<string, string> = {
  user: 'User',
  admin: 'Admin',
  system: 'System',
}
const ratingBadgeClasses: Record<string, string> = {
  helpful: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  incorrect: 'border-red-200 bg-red-50 text-red-700',
  unhelpful: 'border-amber-200 bg-amber-50 text-amber-700',
}

const ratingOptions = [
  { value: '', label: 'All' },
  { value: 'helpful', label: 'Helpful' },
  { value: 'incorrect', label: 'Incorrect' },
  { value: 'unhelpful', label: 'Unhelpful' },
]

const activeTab = ref<ConsoleTab>('feedback')
const rangeDays = ref(30)
const ratingFilter = ref('')
const actionFilter = ref('')
const loading = ref(true)
const error = ref('')
const feedback = ref<AiFeedbackResponse | null>(null)
const audit = ref<AiAuditResponse | null>(null)

const feedbackRows = computed(() => feedback.value?.data ?? [])
const auditRows = computed(() => audit.value?.data ?? [])
const feedbackSummary = computed(() => feedback.value?.summary ?? { total: 0, byRating: {} })
const auditSummary = computed(() => audit.value?.summary ?? { total: 0, byAction: {} })
const auditActions = computed(() => {
  const actions = Object.keys(auditSummary.value.byAction)
  if (actionFilter.value && !actions.includes(actionFilter.value)) actions.push(actionFilter.value)
  return actions.sort()
})

const countByRating = (rating: string) => feedbackSummary.value.byRating[rating] ?? 0
const auditCount = (action: string) => auditSummary.value.byAction[action] ?? 0
const governanceChanges = computed(
  () => auditCount('school_ai_settings_updated') + auditCount('ai_platform_settings_updated'),
)
const feedbackEvents = computed(() => auditCount('ai_feedback_submitted'))

const fromDate = (days: number) => new Date(Date.now() - days * 86400000).toISOString()

const actionLabel = (action: string) =>
  actionLabels[action] ??
  action
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const actionBadgeClasses = (action: string) => {
  if (action === 'ai_feature_blocked') return 'border-red-200 bg-red-50 text-red-700'
  if (action === 'ai_feedback_submitted') return 'border-sky-200 bg-sky-50 text-sky-700'
  if (action.endsWith('settings_updated')) return 'border-slate-200 bg-slate-100 text-slate-700'
  return 'border-slate-200 bg-slate-50 text-slate-600'
}

const auditDetail = (row: AiAuditRow) => {
  const meta = row.meta ?? {}
  if (row.action === 'ai_feature_blocked') {
    const parts = [row.target ?? meta.feature, meta.code].filter(Boolean).map(String)
    return parts.join(' · ')
  }
  if (row.action === 'ai_feedback_submitted') {
    return [meta.feature, meta.rating].filter(Boolean).map(String).join(' · ')
  }
  if (Array.isArray(meta.fields)) return (meta.fields as string[]).join(', ')
  return Object.entries(meta)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join(' · ')
}

const formatDate = (value: string | Date) => {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const maskId = (id: string) => (id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id)

const switchTab = (tab: ConsoleTab) => {
  activeTab.value = tab
  void loadActive()
}

const setRange = (days: number) => {
  rangeDays.value = days
  void loadActive()
}

const setRating = (rating: string) => {
  ratingFilter.value = rating
  void loadFeedback()
}

const loadFeedback = async () => {
  loading.value = true
  error.value = ''
  try {
    feedback.value = await aiApi.feedback({
      from: fromDate(rangeDays.value),
      rating: ratingFilter.value || undefined,
    })
  } catch (err) {
    error.value = 'Unable to load AI feedback.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadAudit = async () => {
  loading.value = true
  error.value = ''
  try {
    audit.value = await aiApi.audit({
      from: fromDate(rangeDays.value),
      action: actionFilter.value || undefined,
    })
  } catch (err) {
    error.value = 'Unable to load the AI audit trail.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadActive = () => (activeTab.value === 'feedback' ? loadFeedback() : loadAudit())

onMounted(loadActive)
</script>