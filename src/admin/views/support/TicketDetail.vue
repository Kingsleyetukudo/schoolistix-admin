<template>
  <AdminFeaturePage
    title="Ticket Detail"
    description="View a full ticket conversation and reply on behalf of the support team."
  >
    <div v-if="isLoading" class="rounded-lg border border-black bg-white p-8 text-center text-sm text-slate-500">
      Loading ticket…
    </div>
    <div v-else-if="!ticket" class="rounded-lg border border-black bg-white p-8 text-center text-sm text-slate-500">
      Ticket not found.
    </div>
    <div v-else class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <AdminPanelCard title="Conversation" description="Ticket thread and activity history.">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <h3 class="mr-auto text-lg font-semibold text-slate-900">{{ ticket.subject }}</h3>
          <AdminStatusBadge :status="String(ticket.status)" />
          <AdminStatusBadge :status="String(ticket.priority)" />
        </div>
        <p class="mb-4 text-xs text-slate-500">
          {{ schoolName }} ·
          {{ formatDate(ticket.created_at) }}
        </p>

        <div class="space-y-3">
          <div class="rounded-lg border border-black bg-white p-4">
            <p class="text-xs font-semibold text-slate-500">{{ ticket.created_by_name ?? 'School' }}</p>
            <p class="mt-1 whitespace-pre-wrap text-sm text-slate-800">{{ ticket.message }}</p>
          </div>
          <div
            v-for="reply in replies"
            :key="String(reply.id)"
            class="rounded-lg border border-black bg-white p-4"
            :class="{ 'bg-slate-50': reply.is_internal }"
          >
            <p class="text-xs font-semibold text-slate-500">
              {{ replyAuthor(reply) }}
              <span v-if="reply.is_internal" class="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">Internal</span>
            </p>
            <p class="mt-1 whitespace-pre-wrap text-sm text-slate-800">{{ reply.message }}</p>
            <p class="mt-2 text-xs text-slate-400">{{ formatDate(reply.created_at) }}</p>
          </div>
        </div>
      </AdminPanelCard>
      <TicketReplyForm :ticket-id="String(ticket.id)" @replied="load" />
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import { supportApi } from '@admin/services/supportApi'
import TicketReplyForm from './components/TicketReplyForm.vue'

const route = useRoute()
const ticket = ref<Record<string, unknown> | null>(null)
const isLoading = ref(false)

const schoolName = computed(() => {
  const school = ticket.value?.school
  const schoolRecord = school && typeof school === 'object' ? (school as Record<string, unknown>) : null
  return String(ticket.value?.school_name ?? schoolRecord?.name ?? '')
})

const replies = computed(() => {
  const raw = ticket.value?.replies
  return Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : []
})

const replyAuthor = (reply: Record<string, unknown>) => {
  const authorName = reply.author_name
  if (authorName) return String(authorName)
  const admin = reply.admin_user
  const adminRecord = admin && typeof admin === 'object' ? (admin as Record<string, unknown>) : null
  return String(adminRecord?.name ?? 'Support')
}

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const load = async () => {
  const id = String(route.params.id ?? '')
  if (!id) return
  isLoading.value = true
  try {
    ticket.value = await supportApi.getDetail(id)
  } catch {
    ticket.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
watch(() => route.params.id, load)
</script>