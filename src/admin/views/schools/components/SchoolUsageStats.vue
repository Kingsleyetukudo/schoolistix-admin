<template>
  <AdminPanelCard title="Usage Snapshot" description="Students, staff, storage, and activity counts for this school.">
    <div class="grid grid-cols-2 gap-3">
      <div v-for="metric in metrics" :key="metric.label" class="rounded-lg border border-black bg-white p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ metric.label }}</p>
        <p class="mt-2 text-xl font-bold text-slate-900">{{ metric.value }}</p>
      </div>
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
    { label: 'Storage', value: storage },
    { label: 'Payments', value: payments.toLocaleString() },
  ]
})
</script>