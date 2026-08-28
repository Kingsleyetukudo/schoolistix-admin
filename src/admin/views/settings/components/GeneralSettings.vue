<template>
  <AdminPanelCard title="General Settings" description="Platform name, support contact details, and default plan.">
    <div
      v-if="notice"
      class="mb-3 rounded-lg border px-4 py-3 text-sm font-medium"
      :class="noticeType === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'"
    >
      {{ notice }}
    </div>

    <form class="space-y-4" @submit.prevent="save">
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Platform name</label>
          <input
            v-model="platformName"
            type="text"
            class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Support email</label>
          <input
            v-model="supportEmail"
            type="email"
            class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Support phone</label>
          <input
            v-model="supportPhone"
            type="tel"
            class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Default plan</label>
          <SearchableDropdownSelect
            label="Default plan"
            :model-value="defaultPlan"
            :options="planOptions"
            placeholder="Select a plan"
            compact
            full-width
            @change="defaultPlan = $event"
          />
        </div>
      </div>
      <button
        type="submit"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="saving"
      >
        {{ saving ? 'Saving…' : 'Save Settings' }}
      </button>
    </form>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { useSettingsStore } from '@admin/stores/settings.store'

const emit = defineEmits<{ (e: 'saved'): void }>()

const store = useSettingsStore()
const platformName = ref('')
const supportEmail = ref('')
const supportPhone = ref('')
const defaultPlan = ref('')
const saving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const planOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
]

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

const syncFromStore = () => {
  const settings = store.settings
  platformName.value = String(settings.platform_name ?? settings.platformName ?? '')
  supportEmail.value = String(settings.support_email ?? settings.supportEmail ?? '')
  supportPhone.value = String(settings.support_phone ?? settings.supportPhone ?? '')
  defaultPlan.value = String(settings.default_plan ?? 'free')
}

watch(() => store.settings, syncFromStore, { deep: true })
onMounted(syncFromStore)

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await store.saveSettings({
      platform_name: platformName.value.trim(),
      support_email: supportEmail.value.trim(),
      support_phone: supportPhone.value.trim(),
      default_plan: defaultPlan.value,
    })
    showNotice('Platform settings saved.', 'success')
    emit('saved')
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}
</script>