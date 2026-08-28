<template>
  <AdminPanelCard title="Reply" description="Send a response to the school or add an internal note.">
    <div
      v-if="notice"
      class="mb-3 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="noticeType === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'"
    >
      {{ notice }}
    </div>

    <form class="space-y-3" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Update status</label>
        <SearchableDropdownSelect
          label="Status"
          :model-value="status"
          :options="statusOptions"
          placeholder="Keep current status"
          full-width
          @change="status = $event"
        />
      </div>
      <textarea
        v-model="message"
        rows="4"
        class="min-h-28 w-full rounded-lg border border-black bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
        placeholder="Write a reply..."
        required
      ></textarea>
      <label class="flex items-center gap-2 text-sm text-slate-700">
        <input v-model="isInternal" type="checkbox" class="h-4 w-4" />
        Internal note (not visible to the school)
      </label>
      <button
        type="submit"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="!message.trim() || saving"
      >
        {{ saving ? 'Sending…' : 'Send Reply' }}
      </button>
    </form>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { supportApi } from '@admin/services/supportApi'

const props = defineProps<{ ticketId: string }>()
const emit = defineEmits<{ (e: 'replied'): void }>()

const statusOptions = [
  { label: 'Pending agent response', value: 'pending_agent_response' },
  { label: 'Awaiting customer reply', value: 'pending_customer_response' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Answered', value: 'answered' },
  { label: 'Closed', value: 'closed' },
]

const message = ref('')
const isInternal = ref(false)
const status = ref('')
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

const submit = async () => {
  if (saving.value || !message.value.trim()) return
  saving.value = true
  try {
    await supportApi.reply(props.ticketId, message.value.trim(), isInternal.value, status.value || undefined)
    showNotice(isInternal.value ? 'Internal note added.' : 'Reply sent.', 'success')
    message.value = ''
    isInternal.value = false
    status.value = ''
    emit('replied')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}
</script>