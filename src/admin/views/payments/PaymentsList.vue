<template>
  <AdminFeaturePage
    title="Payments & Approvals"
    description="Review all school payments and approve or reject pending manual payments to grant tester and subscription access."
  >
    <template #actions>
      <button
        type="button"
        class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
        @click="loadPayments"
      >
        Refresh
      </button>
    </template>

    <div
      v-if="notice"
      class="mb-4 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="
        noticeType === 'success'
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
          : 'border-rose-300 bg-rose-50 text-rose-800'
      "
    >
      {{ notice }}
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <SearchableDropdownSelect
        label="Status"
        :model-value="activeStatus"
        :options="statusOptions"
        placeholder="All statuses"
        @change="setStatus"
      />
      <span class="text-sm text-slate-500">
        {{ filteredRows.length }} payment{{ filteredRows.length === 1 ? '' : 's' }} · {{ pendingCount }} pending
      </span>
    </div>

    <AdminDataTable
      :columns="columns"
      :rows="filteredRows"
      :hasActions="true"
      :searchFields="['school_name', 'reference']"
      search-placeholder="Search by school or reference..."
      @export="onExport"
    >
      <template #column-status="{ row }">
        <AdminStatusBadge :status="String(row.status)" />
      </template>
      <template #column-amount="{ row }">
        <span class="font-semibold text-slate-900">{{ formatAmount(row) }}</span>
      </template>
      <template #column-plan="{ row }">
        <span class="text-xs uppercase tracking-wide text-slate-700">{{ String(row.plan ?? '—') }}</span>
      </template>
      <template #column-gateway="{ row }">
        <span class="rounded-lg border border-black/20 bg-slate-50 px-2 py-1 text-xs uppercase tracking-wide text-slate-700">
          {{ String(row.gateway ?? '—') }}
        </span>
      </template>
      <template #column-paid_at="{ row }">
        <span class="text-sm text-slate-600">{{ formatDate(row.paid_at) }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <template v-if="String(row.status).toLowerCase() === 'pending'">
            <button
              type="button"
              class="rounded-lg border border-emerald-700 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
              @click="openApprove(row)"
            >
              Approve
            </button>
            <button
              type="button"
              class="rounded-lg border border-rose-700 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
              @click="openReject(row)"
            >
              Reject
            </button>
          </template>
          <span v-else class="text-xs text-slate-500">—</span>
        </div>
      </template>
    </AdminDataTable>

    <AdminConfirmModal
      :open="approveOpen"
      title="Approve manual payment?"
      :description="approveDescription"
      @cancel="approveOpen = false"
      @confirm="confirmApprove"
    />

    <div
      v-if="rejectOpen"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
      @click.self="rejectOpen = false"
    >
      <div class="w-full max-w-md rounded-xl border border-black bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-slate-900">Reject manual payment?</h3>
        <p class="mt-2 text-sm text-slate-600">
          This marks the payment as failed and the school will not receive access.
        </p>
        <textarea
          v-model="rejectReason"
          rows="3"
          class="mt-4 w-full rounded-lg border border-black bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
          placeholder="Optional reason (stored on the payment record)"
        ></textarea>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="rejectOpen = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
            @click="confirmReject"
          >
            Reject Payment
          </button>
        </div>
      </div>
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AdminDataTable from '@admin/components/common/AdminDataTable.vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import AdminConfirmModal from '@admin/components/common/AdminConfirmModal.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { paymentsApi } from '@admin/services/paymentsApi'
import { formatNumber } from '@admin/utils/formatters'

type PaymentRow = Record<string, unknown>

const rows = ref<PaymentRow[]>([])
const activeStatus = ref('')
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')
const approveOpen = ref(false)
const rejectOpen = ref(false)
const rejectReason = ref('')
const pendingPayment = ref<PaymentRow | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | null = null

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Successful', value: 'success' },
  { label: 'Failed', value: 'failed' },
]

const columns = [
  { key: 'school_name', label: 'School', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'gateway', label: 'Gateway', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'reference', label: 'Reference', sortable: true },
  { key: 'paid_at', label: 'Paid At', sortable: true },
]

const pendingCount = computed(
  () => rows.value.filter((row) => String(row.status).toLowerCase() === 'pending').length,
)

const filteredRows = computed(() => {
  if (!activeStatus.value) return rows.value
  return rows.value.filter((row) => String(row.status).toLowerCase() === activeStatus.value)
})

const approveDescription = computed(() => {
  const payment = pendingPayment.value
  if (!payment) return ''
  return `Confirm the ₦${formatNumber(Number(payment.amount) || 0)} manual payment from ${String(payment.school_name ?? 'this school')}. This activates the school's ${String(payment.plan ?? 'current').toUpperCase()} plan access.`
})

const normalizeRow = (row: PaymentRow): PaymentRow => ({
  id: row.id,
  school_name: row.school_name ?? row.schoolName ?? '',
  amount: row.amount,
  plan: row.subscription_plan ?? row.plan ?? '',
  gateway: row.gateway ?? '',
  status: row.status,
  reference: row.reference ?? '',
  paid_at: row.paid_at ?? row.paidAt ?? row.created_at ?? '',
  method: row.method ?? '',
})

const formatAmount = (row: PaymentRow) => `₦${formatNumber(Number(row.amount) || 0)}`

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const showNotice = (message: string, type: 'success' | 'error') => {
  notice.value = message
  noticeType.value = type
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 5000)
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

const loadPayments = async () => {
  try {
    const response = await paymentsApi.list()
    rows.value = response.data.map(normalizeRow)
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  }
}

const setStatus = (value: string) => {
  activeStatus.value = value
}

const onExport = (data: PaymentRow[]) => {
  const header = Object.keys(data[0] ?? {}).join(',')
  const lines = data.map((row) =>
    Object.values(row)
      .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'payments.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

const openApprove = (row: PaymentRow) => {
  pendingPayment.value = row
  approveOpen.value = true
}

const confirmApprove = async () => {
  const payment = pendingPayment.value
  if (!payment) return
  approveOpen.value = false
  try {
    const result = await paymentsApi.approve(String(payment.id))
    showNotice(
      result.activated
        ? `Payment approved — ${String(payment.school_name ?? 'school')} access activated.`
        : 'Payment approved.',
      'success',
    )
    await loadPayments()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    pendingPayment.value = null
  }
}

const openReject = (row: PaymentRow) => {
  pendingPayment.value = row
  rejectReason.value = ''
  rejectOpen.value = true
}

const confirmReject = async () => {
  const payment = pendingPayment.value
  if (!payment) return
  rejectOpen.value = false
  try {
    await paymentsApi.reject(String(payment.id), rejectReason.value.trim() || undefined)
    showNotice(`Payment from ${String(payment.school_name ?? 'school')} was rejected.`, 'success')
    await loadPayments()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    pendingPayment.value = null
  }
}

onMounted(loadPayments)
</script>