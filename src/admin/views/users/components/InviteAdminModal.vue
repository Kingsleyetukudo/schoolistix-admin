<template>
  <AdminPanelCard title="Invite Admin" description="Invite a new internal teammate and assign a scoped admin role.">
    <div
      v-if="notice"
      class="mb-3 rounded-xl border px-4 py-3 text-sm font-medium"
      :class="
        noticeType === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      "
    >
      {{ notice }}
    </div>

    <form class="space-y-3" @submit.prevent="submitInvite">
      <input
        v-model="fullName"
        class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
        placeholder="Full name"
        required
      />
      <input
        v-model="email"
        type="email"
        class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
        placeholder="Work email"
        required
      />
      <SearchableDropdownSelect
        label="Role"
        :model-value="role"
        :options="roleOptions"
        full-width
        @change="role = $event"
      />
      <button
        type="submit"
        class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Sending…' : 'Send Invite' }}
      </button>
    </form>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { usersApi } from '@admin/services/usersApi'

const emit = defineEmits<{ invited: [] }>()

const fullName = ref('')
const email = ref('')
const role = ref('support_admin')

const roleOptions = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Billing Admin', value: 'billing_admin' },
  { label: 'Support Admin', value: 'support_admin' },
  { label: 'Technical Admin', value: 'technical_admin' },
  { label: 'Auditor', value: 'auditor' },
]
const isSubmitting = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const showNotice = (message: string, type: 'success' | 'error') => {
  notice.value = message
  noticeType.value = type
}

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

const submitInvite = async () => {
  if (isSubmitting.value) return
  const parts = fullName.value.trim().split(/\s+/)
  isSubmitting.value = true
  try {
    const result = (await usersApi.invite({
      firstName: parts[0] || 'Invited',
      lastName: parts.slice(1).join(' ') || 'Admin',
      email: email.value.trim(),
      role: role.value,
    })) as Record<string, unknown>
    const temporaryPassword = String(result?.temporary_password ?? '')
    const emailSent = Boolean(result?.email_sent)
    const emailError = String(result?.email_error ?? '')
    if (emailSent) {
      showNotice(`Invite sent to ${email.value.trim()}. Login details were emailed to them.`, 'success')
    } else if (temporaryPassword) {
      showNotice(
        `Invite created, but the email could not be sent (${emailError || 'unknown reason'}). Share these login details with ${email.value.trim()}: temporary password ${temporaryPassword}.`,
        'success',
      )
    } else {
      showNotice(`Invite sent to ${email.value.trim()}.`, 'success')
    }
    fullName.value = ''
    email.value = ''
    role.value = 'support_admin'
    emit('invited')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>