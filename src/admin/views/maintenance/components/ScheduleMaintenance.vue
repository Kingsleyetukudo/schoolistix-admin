<template>
  <AdminPanelCard title="Schedule Maintenance" description="Plan maintenance windows and coordinate communication ahead of downtime.">
    <div
      v-if="notice"
      class="mb-3 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="noticeType === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'"
    >
      {{ notice }}
    </div>

    <div class="space-y-3">
      <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Starts at</label>
      <input
        v-model="startsAt"
        type="datetime-local"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
      />
      <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Ends at</label>
      <input
        v-model="endsAt"
        type="datetime-local"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
      />
      <input
        v-model="message"
        type="text"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
        placeholder="Public message"
      />
      <input
        v-model="reason"
        type="text"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
        placeholder="Reason"
      />
      <button
        type="button"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="saving || !startsAt || !endsAt"
        @click="schedule"
      >
        {{ saving ? 'Scheduling…' : 'Schedule Window' }}
      </button>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { maintenanceApi } from '@admin/services/maintenanceApi'

const emit = defineEmits<{ (e: 'changed'): void }>()

const startsAt = ref('')
const endsAt = ref('')
const message = ref('')
const reason = ref('')
const saving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const showNotice = (value: string, type: 'success' | 'error') => {
  notice.value = value
  noticeType.value = type
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

const schedule = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await maintenanceApi.schedule({
      startsAt: startsAt.value ? new Date(startsAt.value).toISOString() : undefined,
      endsAt: endsAt.value ? new Date(endsAt.value).toISOString() : undefined,
      message: message.value.trim() || undefined,
      reason: reason.value.trim() || undefined,
    })
    showNotice('Maintenance window scheduled.', 'success')
    startsAt.value = ''
    endsAt.value = ''
    message.value = ''
    reason.value = ''
    emit('changed')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}
</script>