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
          <h3 class="mr-auto text-lg font-semibold text-slate-900">
            {{ ticket.subject }}
            <span
              v-if="isChat"
              class="ml-2 inline-flex rounded-full bg-[#040738] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
            >
              Live Chat
            </span>
          </h3>
          <AdminStatusBadge v-if="!isChat" :status="String(ticket.status)" />
          <AdminStatusBadge v-if="!isChat" :status="String(ticket.priority)" />
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
      <div class="grid gap-4">
        <AdminPanelCard
          title="Assignment"
          description="Assign this conversation to an admin, keep it for yourself, or leave it unassigned."
        >
          <div class="grid gap-3">
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-black bg-slate-50 px-3 py-2.5 text-sm"
            >
              <span
                class="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Assigned to
              </span>
              <span class="font-semibold text-slate-800">
                {{ assignedToLabel }}
              </span>
            </div>

            <SearchableDropdownSelect
              label="Assign to admin"
              :model-value="assignedAdminId"
              :options="adminOptions"
              placeholder="Select an admin"
              full-width
              @change="onAssignChange"
            />

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                :disabled="isAssigning"
                @click="assignToMe"
              >
                Assign to me
              </button>
              <button
                v-if="ticket.assigned_to"
                type="button"
                class="rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                :disabled="isAssigning"
                @click="unassign"
              >
                Unassign
              </button>
            </div>

            <p
              v-if="assignmentNotice"
              class="text-xs font-semibold"
              :class="
                assignmentNoticeType === 'error'
                  ? 'text-rose-600'
                  : 'text-emerald-600'
              "
            >
              {{ assignmentNotice }}
            </p>
          </div>
        </AdminPanelCard>

        <TicketReplyForm
          :ticket-id="String(ticket.id)"
          :channel="channel"
          @replied="load"
        />
      </div>
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { useAdminAuth } from '@admin/composables/useAdminAuth'
import { supportApi } from '@admin/services/supportApi'
import { useSupportStore } from '@admin/stores/support.store'
import { usersApi } from '@admin/services/usersApi'
import TicketReplyForm from './components/TicketReplyForm.vue'

const route = useRoute()
const { user: authUser } = useAdminAuth()
const supportStore = useSupportStore()
const ticket = ref<Record<string, unknown> | null>(null)
const isLoading = ref(false)
const admins = ref<Array<{ id: string; name: string; email: string; role: string }>>([])
const assignedAdminId = ref('')
const isAssigning = ref(false)
const assignmentNotice = ref('')
const assignmentNoticeType = ref<'success' | 'error'>('success')

const schoolName = computed(() => {
  const school = ticket.value?.school
  const schoolRecord = school && typeof school === 'object' ? (school as Record<string, unknown>) : null
  return String(ticket.value?.school_name ?? schoolRecord?.name ?? '')
})

const channel = computed(() => String(ticket.value?.channel ?? 'ticket'))

const isChat = computed(() => channel.value === 'chat')

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

const assignedToLabel = computed(() => {
  const assigned = ticket.value?.assigned_to
  const record = assigned && typeof assigned === 'object' ? (assigned as Record<string, unknown>) : null
  return String(record?.name ?? 'Unassigned')
})

const adminOptions = computed(() =>
  admins.value.map((admin) => ({
    label: admin.name ? `${admin.name} (${admin.email})` : admin.email,
    value: admin.id,
  })),
)

const loadAdmins = async () => {
  try {
    admins.value = await usersApi.list()
  } catch {
    admins.value = []
  }
}

const syncAssignedAdminId = () => {
  const assigned = ticket.value?.assigned_to
  const record = assigned && typeof assigned === 'object' ? (assigned as Record<string, unknown>) : null
  assignedAdminId.value = String(record?.id ?? '')
}

const saveAssignment = async (adminId: string) => {
  const id = String(route.params.id ?? '')
  if (!id) return
  isAssigning.value = true
  assignmentNotice.value = ''
  try {
    await supportApi.assign(id, adminId)
    await load()
    assignmentNoticeType.value = 'success'
    assignmentNotice.value = adminId ? 'Assignment updated.' : 'Ticket unassigned.'
  } catch {
    assignmentNoticeType.value = 'error'
    assignmentNotice.value = 'Unable to update the assignment.'
  } finally {
    isAssigning.value = false
  }
}

const onAssignChange = (value: string) => {
  void saveAssignment(String(value ?? ''))
}

const assignToMe = () => {
  void saveAssignment(String(authUser.value?.id ?? ''))
}

const unassign = () => {
  void saveAssignment('')
}

const load = async () => {
  const id = String(route.params.id ?? '')
  if (!id) return
  isLoading.value = true
  try {
    ticket.value = await supportApi.getDetail(id)
    syncAssignedAdminId()
    void supportStore.markTicketRead(id).catch(() => {})
  } catch {
    ticket.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadAdmins()
  void load()
})
watch(() => route.params.id, load)
</script>