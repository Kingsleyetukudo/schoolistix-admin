<template>
  <AdminFeaturePage
    title="AI Usage & Cost"
    description="Monitor AI requests, errors, feature usage, and plan quotas across schools."
  >
    <div
      v-if="killSwitchOn"
      class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
    >
      Platform AI kill switch is ON — all AI features are disabled for every school.
    </div>
    <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Requests (24h)</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">{{ last24?.total ?? 0 }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Errors (24h)</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">{{ last24?.errors ?? 0 }}</p>
        <p class="mt-1 text-xs text-slate-400">Rate: {{ last24?.errorRate ?? 0 }}%</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Requests ({{ rangeDays }}d)</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">{{ usage?.total ?? 0 }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Blocked attempts</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">{{ usage?.blocked ?? 0 }}</p>
        <p class="mt-1 text-xs text-slate-400">Provider: {{ providerLabel }}</p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm font-medium text-slate-600">Usage by feature</p>
      <div class="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-medium">
        <button
          v-for="days in [7, 30, 90]"
          :key="days"
          type="button"
          class="px-3 py-1.5 transition"
          :class="rangeDays === days ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'"
          @click="setRange(days)"
        >
          {{ days }}d
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-4 text-sm text-slate-500">Loading AI platform data...</div>

    <template v-else>
      <section class="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th class="px-5 py-3 font-medium">Feature</th>
              <th class="px-5 py-3 font-medium">Requests</th>
              <th class="px-5 py-3 font-medium">Errors</th>
              <th class="px-5 py-3 font-medium">Blocked</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in featureRows"
              :key="row.feature"
              class="border-b border-slate-50 last:border-0"
            >
              <td class="px-5 py-3 capitalize text-slate-800">{{ row.label || row.feature }}</td>
              <td class="px-5 py-3 text-slate-600">{{ row.requests }}</td>
              <td class="px-5 py-3 text-slate-600">{{ row.errors }}</td>
              <td class="px-5 py-3 text-slate-600">{{ row.blocked }}</td>
            </tr>
            <tr v-if="!featureRows.length">
              <td class="px-5 py-6 text-center text-slate-400" colspan="4">No AI usage recorded yet.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="mt-4 grid gap-4 xl:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 class="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
            Usage by school
          </h3>
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th class="px-5 py-2.5 font-medium">School</th>
                <th class="px-5 py-2.5 font-medium">Requests</th>
                <th class="px-5 py-2.5 font-medium">Errors</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in schoolRows"
                :key="row.schoolId"
                class="border-b border-slate-50 last:border-0"
              >
                <td class="px-5 py-2.5 text-slate-800">{{ row.schoolName || row.schoolId }}</td>
                <td class="px-5 py-2.5 text-slate-600">{{ row.requests }}</td>
                <td class="px-5 py-2.5 text-slate-600">{{ row.errors }}</td>
              </tr>
              <tr v-if="!schoolRows.length">
                <td class="px-5 py-6 text-center text-slate-400" colspan="3">No usage recorded.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 class="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
            Quota utilization
          </h3>
          <div class="divide-y divide-slate-100">
            <div
              v-for="row in quotaRows.slice(0, 12)"
              :key="row.schoolId"
              class="flex items-center gap-3 px-5 py-3"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm text-slate-800">{{ row.schoolName }}</p>
                <p class="text-xs text-slate-400">
                  {{ row.billingPlan }} · {{ row.quota.limited ? row.quota.used + ' used' : 'unlimited' }}
                </p>
              </div>
              <div class="w-28">
                <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full"
                    :class="row.quota.percent >= 100 ? 'bg-red-500' : row.quota.percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'"
                    :style="{ width: Math.min(100, row.quota.percent) + '%' }"
                  ></div>
                </div>
              </div>
              <span
                class="w-14 text-right text-xs font-semibold"
                :class="row.quota.allowed ? 'text-slate-500' : 'text-red-600'"
              >
                {{ row.quota.limited ? row.quota.percent + '%' : '—' }}
              </span>
            </div>
            <p v-if="!quotaRows.length" class="px-5 py-6 text-center text-sm text-slate-400">
              No schools to display.
            </p>
          </div>
        </section>
      </div>
    </template>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import {
  aiApi,
  type AiFeatureUsageRow,
  type AiHealthResponse,
  type AiSchoolQuotaRow,
  type AiSchoolUsageRow,
  type AiUsageResponse,
} from '@admin/services/aiApi'

const loading = ref(true)
const error = ref('')
const rangeDays = ref(30)
const usage = ref<AiUsageResponse | null>(null)
const health = ref<AiHealthResponse | null>(null)
const features = ref<AiFeatureUsageRow[]>([])
const schoolUsage = ref<AiSchoolUsageRow[]>([])
const quotaRows = ref<AiSchoolQuotaRow[]>([])

const last24 = computed(() => health.value?.last24h ?? null)
const killSwitchOn = computed(() => Boolean(health.value?.killSwitchEnabled))
const providerLabel = computed(() =>
  health.value?.provider?.configured ? health.value.provider.defaultModel : 'not configured',
)

const featureRows = computed(() => {
  const source = features.value.length
    ? features.value
    : Object.entries(usage.value?.byFeature ?? {}).map(([feature, counts]) => ({
        feature,
        label: feature,
        requests: counts.requests,
        errors: counts.errors,
        blocked: counts.blocked,
      }))
  return source.slice().sort((a, b) => b.requests - a.requests)
})

const schoolRows = computed(() =>
  schoolUsage.value
    .slice()
    .sort((a, b) => b.requests - a.requests)
    .map((row) => ({
      ...row,
      schoolName: quotaRows.value.find((q) => q.schoolId === row.schoolId)?.schoolName ?? row.schoolId,
    })),
)

const fromDate = (days: number) => new Date(Date.now() - days * 86400000).toISOString()

const loadAll = async () => {
  loading.value = true
  error.value = ''
  try {
    const [usageData, featureData, schoolData, quotaData, healthData] = await Promise.all([
      aiApi.usage({ from: fromDate(rangeDays.value) }),
      aiApi.usageByFeatures(),
      aiApi.usageBySchools(),
      aiApi.quotas(),
      aiApi.health(),
    ])
    usage.value = usageData
    features.value = featureData.features ?? []
    schoolUsage.value = schoolData.schools ?? []
    quotaRows.value = quotaData.schools ?? []
    health.value = healthData
  } catch (err) {
    error.value = 'Unable to load AI platform data.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const setRange = async (days: number) => {
  rangeDays.value = days
  await loadAll()
}

onMounted(loadAll)
</script>