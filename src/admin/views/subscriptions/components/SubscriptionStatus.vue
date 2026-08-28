<template>
  <AdminPanelCard title="Subscription Status" description="Plan tier, next billing date, owner, and renewal posture.">
    <dl class="grid gap-3 text-sm text-slate-700">
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">School</dt>
        <dd class="font-semibold text-slate-900">{{ String(detail?.school_name ?? '—') }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Current Plan</dt>
        <dd class="font-semibold text-slate-900">{{ planName }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Amount</dt>
        <dd class="font-semibold text-slate-900">{{ amount }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Billing cycle</dt>
        <dd>{{ String(subscription.billingCycle ?? '—').toUpperCase() }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Status</dt>
        <dd><AdminStatusBadge :status="String(subscription.status ?? detail?.status ?? '')" /></dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Next billing</dt>
        <dd>{{ formatDate(subscription.nextBillingAt ?? detail?.next_billing_at) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4 border-b border-black/10 pb-2">
        <dt class="text-slate-500">Billing owner</dt>
        <dd>{{ String(detail?.admin_email ?? '—') }}</dd>
      </div>
      <div class="flex items-center justify-between gap-4">
        <dt class="text-slate-500">Students</dt>
        <dd>{{ Number(detail?.student_count ?? 0).toLocaleString() }}</dd>
      </div>
    </dl>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'

const props = defineProps<{ detail: Record<string, unknown> }>()

const subscription = computed(() => (props.detail.subscription ?? {}) as Record<string, unknown>)

const planName = computed(() =>
  String(subscription.value.planName ?? props.detail.plan_name ?? subscription.value.plan ?? 'free'),
)

const amount = computed(() => {
  const value = Number(subscription.value.amount ?? props.detail.amount ?? 0)
  const currency = String(subscription.value.currency ?? props.detail.currency ?? 'NGN')
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
})

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
</script>