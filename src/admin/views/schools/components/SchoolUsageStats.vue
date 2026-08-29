<template>
  <AdminPanelCard title="Usage Snapshot" description="Students, staff, storage, and activity counts for this school.">
    <div class="grid grid-cols-2 gap-3">
      <div v-for="metric in metrics" :key="metric.label" class="rounded-lg border border-black bg-white p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ metric.label }}</p>
        <p class="mt-2 text-xl font-bold text-slate-900">{{ metric.value }}</p>
      </div>
    </div>

    <div v-if="storageLimitBytes > 0" class="mt-5 rounded-lg border border-black bg-white p-4">
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Storage capacity</p>
        <p class="text-xs font-bold text-slate-700">
          {{ storageReadable }} of {{ storageLimitReadable }}
        </p>
      </div>
      <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full rounded-full transition-all"
          :class="storagePercent >= 90 ? 'bg-rose-500' : storagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'"
          :style="{ width: `${Math.min(100, storagePercent)}%` }"
        ></div>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        {{ storagePercent.toFixed(1) }}% of the {{ planLabel }} plan capacity
        ({{ storageLimitReadable }}).
      </p>
      <p class="mt-1 text-[11px] leading-5 text-slate-400">
        Storage usage updates as files are uploaded through the app to Cloudinary or local storage.
      </p>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import type { School } from '@admin/types/school.types'

const props = defineProps<{ school?: School | null }>()

const metrics = computed(() => {
  const school = props.school
  if (!school) return []

  const counts = (school.counts ?? {}) as Record<string, unknown>
  const students = Number(counts.students ?? school.students ?? 0)
  const staff = Number(counts.teachers ?? school.staff ?? 0)
  const storage = String(school.storage_readable ?? `${Number(school.storageGb ?? 0)} MB`)
  const payments = Number(counts.payments ?? 0)

  return [
    { label: 'Students', value: students.toLocaleString() },
    { label: 'Teachers', value: staff.toLocaleString() },
    { label: 'Storage used', value: storage },
    { label: 'Payments', value: payments.toLocaleString() },
  ]
})

const storageReadable = computed(() => String(props.school?.storage_readable ?? '0 B'))
const storageLimitReadable = computed(() => String(props.school?.storage_limit_readable ?? '—'))
const storageLimitBytes = computed(() => Number(props.school?.storage_limit_bytes ?? 0))
const storagePercent = computed(() => Number(props.school?.storage_used_percent ?? 0))
const planLabel = computed(() => {
  const plan = String(props.school?.plan ?? 'free')
  return plan.charAt(0).toUpperCase() + plan.slice(1)
})
</script>