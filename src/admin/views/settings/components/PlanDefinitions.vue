<template>
  <AdminPanelCard
    title="Plan Definitions"
    description="Live plan tiers, pricing, and student limits used by the checkout flow."
  >
    <div v-if="plans.length" class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-black">
            <th class="py-2 pr-3 text-left font-semibold text-slate-700">Plan</th>
            <th class="py-2 pr-3 text-left font-semibold text-slate-700">Student limit</th>
            <th class="py-2 pr-3 text-left font-semibold text-slate-700">Monthly</th>
            <th class="py-2 text-left font-semibold text-slate-700">Yearly</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="plan in plans"
            :key="String(plan.key)"
            class="border-b border-black/10"
          >
            <td class="py-2 pr-3">
              <span class="font-semibold text-slate-900">{{ plan.name }}</span>
              <span class="ml-2 rounded border border-black px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                {{ plan.key }}
              </span>
            </td>
            <td class="py-2 pr-3 text-slate-700">
              {{ studentLimitLabel(plan.student_limit) }}
            </td>
            <td class="py-2 pr-3 text-slate-700">
              {{ priceLabel(plan.monthly_price) }}
            </td>
            <td class="py-2 text-slate-700">
              {{ priceLabel(plan.yearly_price) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="rounded-lg border border-black/20 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      Plan definitions are not available yet.
    </p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { useSettingsStore } from '@admin/stores/settings.store'

const store = useSettingsStore()

type PlanDefinition = {
  key: string
  name: string
  monthly_price: number | null
  yearly_price: number | null
  student_limit: number | null
}

const plans = computed<PlanDefinition[]>(() => {
  const raw = store.settings.plan_definitions
  return Array.isArray(raw) ? (raw as PlanDefinition[]) : []
})

const studentLimitLabel = (limit: number | null | undefined) => {
  if (limit === null || limit === undefined) return 'Unlimited'
  return Number(limit).toLocaleString()
}

const priceLabel = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Custom quote'
  const amount = Number(value)
  if (amount <= 0) return 'Free'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

onMounted(() => {
  store.fetchSettings()
})
</script>