<template>
  <AdminPanelCard title="Payment History" description="Recent subscription payments for this school.">
    <div v-if="history.length" class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-black">
            <th class="py-2 pr-3 text-left font-semibold text-slate-700">Amount</th>
            <th class="py-2 pr-3 text-left font-semibold text-slate-700">Status</th>
            <th class="py-2 pr-3 text-left font-semibold text-slate-700">Gateway</th>
            <th class="py-2 text-left font-semibold text-slate-700">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in history" :key="String(payment.id ?? payment.reference ?? '')" class="border-b border-black/10">
            <td class="py-2 pr-3 font-semibold text-slate-900">{{ formatAmount(payment) }}</td>
            <td class="py-2 pr-3"><AdminStatusBadge :status="String(payment.status)" /></td>
            <td class="py-2 pr-3 text-slate-700">{{ String(payment.gateway ?? '—') }}</td>
            <td class="py-2 text-slate-600">{{ formatDate(payment.paid_at ?? payment.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="rounded-lg border border-black/20 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      No payment history yet.
    </p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'

defineProps<{ history: Array<Record<string, unknown>> }>()

const formatAmount = (payment: Record<string, unknown>) => {
  const value = Number(payment.amount ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
</script>