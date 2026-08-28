<template>
  <AdminFeaturePage
    title="Settings"
    description="Configure platform-wide defaults used across the platform."
  >
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <GeneralSettings @saved="savedAt = new Date().toLocaleTimeString()" />
      <AdminPanelCard title="Platform Snapshot" description="Last saved state of platform settings.">
        <dl class="space-y-3 text-sm">
          <div class="flex items-center justify-between border-b border-black/10 pb-2">
            <dt class="text-slate-500">Default plan</dt>
            <dd class="font-semibold text-slate-900">{{ String(settings.default_plan ?? '—').toUpperCase() }}</dd>
          </div>
          <div class="flex items-center justify-between border-b border-black/10 pb-2">
            <dt class="text-slate-500">Feature flags</dt>
            <dd class="font-semibold text-slate-900">{{ featureCount }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-slate-500">Last updated</dt>
            <dd class="text-slate-700">{{ formatDate(settings.updated_at) }}</dd>
          </div>
          <p v-if="savedAt" class="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            Settings saved at {{ savedAt }}.
          </p>
        </dl>
      </AdminPanelCard>
    </div>

    <div class="mt-4">
      <PlanDefinitions />
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { useSettingsStore } from '@admin/stores/settings.store'
import GeneralSettings from './components/GeneralSettings.vue'
import PlanDefinitions from './components/PlanDefinitions.vue'

const store = useSettingsStore()
const savedAt = ref('')

const settings = computed(() => store.settings)
const featureCount = computed(() => {
  const flags = settings.value.feature_flags
  if (flags && typeof flags === 'object') return Object.keys(flags as Record<string, unknown>).length
  return 0
})

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(() => {
  store.fetchSettings()
})
</script>