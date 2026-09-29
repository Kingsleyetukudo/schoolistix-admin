<template>
  <AdminPanelCard title="Direct school communication" description="Send a recorded message to this school by email, SMS, or WhatsApp. Delivery results remain visible here.">
    <div v-if="notice" class="mb-4 rounded-lg border px-4 py-3 text-sm" :class="noticeType === 'error' ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'">
      {{ notice }}
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
      <form class="space-y-3" @submit.prevent="send">
        <div class="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p>Email: <strong>{{ school?.admin_email || 'No school admin email on file' }}</strong></p>
          <p class="mt-1">Phone: <strong>{{ school?.phone || 'No school phone on file' }}</strong></p>
        </div>
        <input v-model="subject" class="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Subject (optional)" />
        <div class="flex flex-wrap gap-4 text-sm">
          <label v-for="channel in channelOptions" :key="channel.value" class="flex items-center gap-2">
            <input v-model="channels" type="checkbox" :value="channel.value" />
            {{ channel.label }}
          </label>
        </div>
        <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input v-model="instruction" class="h-10 rounded-lg border border-slate-300 px-3 text-sm" placeholder="What should the message say?" />
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50" :disabled="isAiBusy || !instruction.trim()" @click="assist('draft')">
            {{ isAiBusy && aiMode === 'draft' ? 'Drafting…' : 'AI draft' }}
          </button>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50" :disabled="isAiBusy || !body.trim()" @click="assist('correct')">
            {{ isAiBusy && aiMode === 'correct' ? 'Reviewing…' : 'Correct with AI' }}
          </button>
        </div>
        <textarea v-model="body" rows="6" class="w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Write a message to the school…" required></textarea>
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs text-slate-500">AI suggestions are editable before sending.</span>
          <button type="submit" class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="isSending || !body.trim() || !channels.length">
            {{ isSending ? 'Sending…' : 'Send to school' }}
          </button>
        </div>
      </form>

      <section class="min-w-0">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-slate-900">Message history</h3>
          <button type="button" class="text-xs font-semibold text-slate-600 underline" :disabled="isLoading" @click="loadMessages">Refresh</button>
        </div>
        <p v-if="isLoading" class="py-6 text-center text-sm text-slate-500">Loading messages…</p>
        <p v-else-if="!messages.length" class="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No messages sent to this school yet.</p>
        <div v-else class="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
          <article v-for="message in messages" :key="message.id" class="rounded-lg border border-slate-200 p-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ message.subject || 'Schoolistix message' }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ message.senderName }} · {{ formatDate(message.createdAt) }}</p>
              </div>
              <span class="text-[11px] text-slate-500">{{ message.channels.join(', ') }}</span>
            </div>
            <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ message.body }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="channel in message.channels" :key="channel" class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">
                {{ channel }}: {{ message.deliveryStatus[channel] || 'unknown' }}
                <span v-if="message.deliveryErrors[channel]"> · {{ message.deliveryErrors[channel] }}</span>
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { aiApi } from '@admin/services/aiApi'
import { schoolCommunicationApi, type AdminSchoolMessage } from '@admin/services/schoolCommunicationApi'
import { playSupportNotificationSound } from '@admin/utils/supportNotificationSound'

const props = defineProps<{ school: Record<string, unknown> | null }>()
const channelOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'WhatsApp', value: 'whatsapp' },
]
const channels = ref<string[]>(['email'])
const subject = ref('')
const instruction = ref('')
const body = ref('')
const messages = ref<AdminSchoolMessage[]>([])
const isLoading = ref(false)
const isSending = ref(false)
const isAiBusy = ref(false)
const aiMode = ref<'draft' | 'correct'>('draft')
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')
const schoolId = () => String(props.school?.id || '')

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) return String(error.response?.data?.error || error.message)
  return error instanceof Error ? error.message : 'Something went wrong.'
}
const showNotice = (value: string, type: 'success' | 'error' = 'success') => {
  notice.value = value
  noticeType.value = type
}
const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
const loadMessages = async () => {
  if (!schoolId()) return
  isLoading.value = true
  try {
    messages.value = await schoolCommunicationApi.list(schoolId())
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isLoading.value = false
  }
}
const assist = async (mode: 'draft' | 'correct') => {
  if (!schoolId()) return
  isAiBusy.value = true
  aiMode.value = mode
  try {
    const result = await aiApi.communicationDraft({
      instruction: instruction.value.trim(),
      existingDraft: body.value.trim(),
      mode,
      tone: 'professional and helpful',
      channels: channels.value,
      schoolName: String(props.school?.name || ''),
    })
    body.value = result.text
    showNotice('AI suggestion added. Review it before sending.')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isAiBusy.value = false
  }
}
const send = async () => {
  if (isSending.value || !schoolId() || !body.value.trim()) return
  isSending.value = true
  try {
    const result = await schoolCommunicationApi.send(schoolId(), {
      subject: subject.value.trim(),
      body: body.value.trim(),
      channels: channels.value,
    })
    messages.value = [result.message, ...messages.value]
    if (Object.values(result.message.deliveryStatus).some((status) => ['sent', 'mock_sent'].includes(status))) {
      void playSupportNotificationSound()
    }
    const statuses = Object.entries(result.message.deliveryStatus).map(([channel, status]) => `${channel}: ${status}`).join(', ')
    showNotice(`Message saved. ${statuses}`)
    subject.value = ''
    body.value = ''
    instruction.value = ''
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isSending.value = false
  }
}
onMounted(loadMessages)
watch(() => props.school?.id, () => {
  messages.value = []
  void loadMessages()
})
</script>
