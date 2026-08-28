<template>
  <AdminFeaturePage
    title="Reports"
    description="Growth, adoption, and plan distribution derived from live platform analytics."
  >
    <div class="mb-6 flex items-center justify-between">
      <p v-if="store.isLoading" class="text-sm text-slate-500">Loading analytics…</p>
      <button
        v-else
        type="button"
        class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
        @click="store.fetchDashboard()"
      >
        Refresh
      </button>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <article v-for="card in kpiCards" :key="card.label" class="rounded-lg border border-black bg-white p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ card.value }}</p>
      </article>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <div class="rounded-lg border border-black bg-white p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500">Growth</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">Schools registered (last {{ charts.range_days }} days)</h2>
        <div class="mt-4">
          <AreaChart
            :data="schoolsAddedSeries"
            :categories="schoolsAddedLabels"
            label="Schools"
            color="#111111"
          />
        </div>
      </div>
      <div class="rounded-lg border border-black bg-white p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500">Adoption</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">Plan distribution</h2>
        <div class="mt-4">
          <DonutChart
            :data="planDistributionData"
            center-label="Schools"
            :center-value="Number(stats.total_schools ?? 0)"
          />
        </div>
      </div>
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AreaChart from '@admin/components/charts/AreaChart.vue'
import DonutChart from '@admin/components/charts/DonutChart.vue'
import { useReportsStore } from '@admin/stores/reports.store'

const store = useReportsStore()

const stats = computed(() => (store.overview?.stats ?? {}) as Record<string, unknown>)
const charts = computed(() => {
  const raw = store.overview?.charts ?? {}
  return {
    range_days: Number((raw as Record<string, unknown>).range_days ?? 30),
    schools_added: Array.isArray((raw as Record<string, unknown>).schools_added)
      ? ((raw as Record<string, unknown>).schools_added as Array<{ key: string; label: string; count: number }>)
      : [],
    plan_distribution: Array.isArray((raw as Record<string, unknown>).plan_distribution)
      ? ((raw as Record<string, unknown>).plan_distribution as Array<{ plan: string; count: number }>)
      : [],
  }
})

const kpiCards = computed(() => [
  { label: 'Total Schools', value: number(stats.value.total_schools) },
  { label: 'Active', value: number(stats.value.active_schools) },
  { label: 'Trial', value: number(stats.value.trial_schools) },
  { label: 'Suspended', value: number(stats.value.suspended_schools) },
  { label: 'Students', value: number(stats.value.total_students) },
  { label: 'Storage', value: String(stats.value.storage_readable ?? '—') },
])

const schoolsAddedSeries = computed(() =>
  charts.value.schools_added.map((bucket) => Number(bucket.count ?? 0)),
)
const schoolsAddedLabels = computed(() =>
  charts.value.schools_added.map((bucket) => String(bucket.label ?? bucket.key ?? '')),
)
const planColors: Record<string, string> = {
  free: '#9ca3af',
  basic: '#3b82f6',
  starter: '#f59e0b',
  growth: '#10b981',
  pro: '#8b5cf6',
  professional: '#8b5cf6',
  enterprise: '#0ea5e9',
}

const planDistributionData = computed(() =>
  charts.value.plan_distribution.map((entry) => ({
    label: String(entry.plan ?? 'free').toUpperCase(),
    value: Number(entry.count ?? 0),
    color: planColors[String(entry.plan ?? 'free').toLowerCase()] ?? '#6b7280',
  })),
)

const number = (value: unknown) => Number(value ?? 0).toLocaleString()

onMounted(() => {
  store.fetchDashboard()
})
</script>