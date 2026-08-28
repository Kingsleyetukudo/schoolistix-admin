<template>
  <AdminPanelCard title="Maintenance Toggle" description="Immediate platform lock, public notice message, and internal preview state.">
    <div
      v-if="notice"
      class="mb-3 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="noticeType === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'"
    >
      {{ notice }}
    </div>

    <label class="flex items-center justify-between rounded-lg border border-black bg-white px-4 py-3 text-sm">
      <span class="font-semibold text-slate-800">Maintenance Mode</span>
      <button
        type="button"
        role="switch"
        :aria-checked="isEnabled"
        :disabled="saving"
        class="relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50"
        :class="isEnabled ? 'bg-emerald-600' : 'bg-slate-300'"
        @click="toggle"
      >
        <span
          class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition"
          :class="isEnabled ? 'left-[22px]' : 'left-0.5'"
        />
      </button>
    </label>

    <div v-if="isEnabled" class="mt-4 space-y-3">
      <input
        v-model="message"
        type="text"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
        placeholder="Public maintenance message"
      />
      <input
        v-model="eta"
        type="datetime-local"
        class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
      />
      <button
        type="button"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? 'Saving…' : 'Save Settings' }}
      </button>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { maintenanceApi } from '@admin/services/maintenanceApi'

const props = defineProps<{ settings: Record<string, unknown> }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const message = ref(String(props.settings.message ?? props.settings.maintenance_mode ?? ''))
const eta = ref(String(props.settings.eta ?? ''))
const saving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const isEnabled = computed(() => Boolean(props.settings.is_enabled ?? props.settings.maintenance_mode === 'active'))

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

const toggle = async () => {
  if (saving.value) return
  saving.value = true
  try {
    if (isEnabled.value) {
      await maintenanceApi.disable({ notes: 'Disabled from admin console.' })
    } else {
      await maintenanceApi.enable({
        message: message.value.trim() || undefined,
        eta: eta.value || undefined,
      })
    }
    showNotice(isEnabled.value ? 'Maintenance mode disabled.' : 'Maintenance mode enabled.', 'success')
    emit('changed')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await maintenanceApi.enable({
      message: message.value.trim() || undefined,
      eta: eta.value || undefined,
    })
    showNotice('Maintenance settings saved.', 'success')
    emit('changed')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}
</script>