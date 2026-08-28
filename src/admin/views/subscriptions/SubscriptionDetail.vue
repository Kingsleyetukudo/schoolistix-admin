<template>
  <AdminFeaturePage
    title="Subscription Detail"
    description="Inspect billing status, plan, and payment history for a selected school."
  >
    <div v-if="!store.selectedSubscription" class="rounded-lg border border-black bg-white p-8 text-center text-sm text-slate-500">
      Loading subscription…
    </div>
    <div v-else class="grid gap-4 xl:grid-cols-2">
      <SubscriptionStatus :detail="store.selectedSubscription" />
      <PaymentHistory :history="paymentHistory" />
      <div class="xl:col-span-2 flex justify-end">
        <button
          type="button"
          class="rounded-lg border border-rose-700 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
          :disabled="isCancelling"
          @click="confirmCancel"
        >
          {{ isCancelling ? 'Cancelling…' : 'Cancel subscription at period end' }}
        </button>
      </div>
    </div>

    <AdminConfirmModal
      :open="cancelOpen"
      title="Cancel subscription?"
      description="The subscription will be cancelled at the end of the current billing period."
      @cancel="cancelOpen = false"
      @confirm="doCancel"
    />
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminConfirmModal from '@admin/components/common/AdminConfirmModal.vue'
import { useSubscriptionsStore } from '@admin/stores/subscriptions.store'
import PaymentHistory from './components/PaymentHistory.vue'
import SubscriptionStatus from './components/SubscriptionStatus.vue'

const route = useRoute()
const store = useSubscriptionsStore()
const cancelOpen = ref(false)
const isCancelling = ref(false)

const detail = computed(() => store.selectedSubscription as Record<string, unknown> | null)
const paymentHistory = computed(() => {
  const history = detail.value?.payment_history
  return Array.isArray(history) ? (history as Array<Record<string, unknown>>) : []
})

const load = () => {
  const id = String(route.params.id ?? '')
  if (id) store.fetchSubscription(id)
}

const confirmCancel = () => {
  cancelOpen.value = true
}

const doCancel = async () => {
  const id = String(detail.value?.school_id ?? route.params.id ?? '')
  if (!id || isCancelling.value) return
  cancelOpen.value = false
  isCancelling.value = true
  try {
    await store.cancelSubscription(id)
  } finally {
    isCancelling.value = false
  }
}

onMounted(load)
watch(() => route.params.id, load)
</script>