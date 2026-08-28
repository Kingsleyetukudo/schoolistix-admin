<template>
  <AdminPanelCard
    title="Feature Toggle"
    description="Platform-wide rollout gates. Toggling a flag updates the live platform setting."
  >
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

    <div v-if="isLoading" class="space-y-3 text-sm">
      <div v-for="index in 4" :key="index" class="h-14 animate-pulse rounded-2xl bg-slate-100" />
    </div>
    <div v-else-if="features.length" class="space-y-3 text-sm">
      <label
        v-for="feature in features"
        :key="feature.key"
        class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"
      >
        <span class="min-w-0">
          <span class="block font-semibold text-slate-800">{{ feature.label }}</span>
          <span class="block truncate text-xs text-slate-500">{{ feature.description }}</span>
        </span>
        <button
          type="button"
          role="switch"
          :aria-checked="feature.enabled"
          :disabled="savingKey === feature.key"
          class="relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50"
          :class="feature.enabled ? 'bg-emerald-500' : 'bg-slate-300'"
          @click="toggleFeature(feature)"
        >
          <span
            class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition"
            :class="feature.enabled ? 'left-[22px]' : 'left-0.5'"
          />
        </button>
      </label>
    </div>
    <p v-else class="text-sm text-slate-500">No feature flags configured.</p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { featuresApi, type FeatureFlagItem } from '@admin/services/featuresApi'

const features = ref<FeatureFlagItem[]>([])
const isLoading = ref(true)
const savingKey = ref('')
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

const loadFeatures = async () => {
  isLoading.value = true
  try {
    features.value = await featuresApi.list()
  } catch {
    showNotice('Unable to load feature flags.', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleFeature = async (feature: FeatureFlagItem) => {
  if (savingKey.value) return
  const nextEnabled = !feature.enabled
  const previousEnabled = feature.enabled
  savingKey.value = feature.key
  feature.enabled = nextEnabled
  try {
    await featuresApi.update(feature.key, nextEnabled)
    showNotice(`${feature.label} ${nextEnabled ? 'enabled' : 'disabled'}.`, 'success')
  } catch (error) {
    feature.enabled = previousEnabled
    showNotice(errorMessage(error), 'error')
  } finally {
    savingKey.value = ''
  }
}

onMounted(loadFeatures)
</script>