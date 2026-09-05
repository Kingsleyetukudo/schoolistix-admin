<template>
  <AdminFeaturePage
    title="AI Settings"
    description="Platform-wide AI defaults, feature toggles, and the global kill switch."
  >
    <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>
    <div v-if="saved" class="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      AI settings saved.
    </div>

    <div v-if="loading" class="text-sm text-slate-500">Loading AI settings...</div>

    <template v-else>
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-700">Global kill switch</h3>
            <p class="mt-1 text-xs text-slate-400">Instantly disables every AI feature for all schools.</p>
          </div>
          <label class="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              v-model="draft.killSwitch"
              class="peer sr-only"
              @change="dirty = true"
            />
            <span
              class="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-red-500 peer-checked:after:translate-x-5"
            ></span>
          </label>
        </div>
        <p v-if="draft.killSwitch" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          WARNING: AI features will be blocked immediately across the platform.
        </p>
      </section>

      <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-700">Default feature toggles</h3>
        <p class="mt-1 text-xs text-slate-400">
          When a toggle is set, it applies to schools that do not override it.
        </p>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          <li
            v-for="feature in metaFeatures"
            :key="feature.key"
            class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
          >
            <span class="text-sm text-slate-700">{{ feature.label }}</span>
            <label class="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                class="peer sr-only"
                :checked="Boolean(draft.enabledFeatures[feature.key])"
                @change="toggleFeature(feature.key)"
              />
              <span
                class="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-5"
              ></span>
            </label>
          </li>
        </ul>
      </section>

      <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-700">Model and limits</h3>
        <div class="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label class="text-sm font-medium text-slate-700" for="ai-default-model">Default model</label>
            <input
              id="ai-default-model"
              v-model="draft.defaultModel"
              type="text"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              @input="dirty = true"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-slate-700" for="ai-platform-limit">Platform monthly request limit</label>
            <input
              id="ai-platform-limit"
              :value="draft.monthlyRequestLimit === null ? '' : draft.monthlyRequestLimit"
              type="number"
              min="0"
              placeholder="Per plan / unlimited"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              @input="onLimitInput($event)"
            />
            <p class="mt-1 text-xs text-slate-400">Optional global cap; school overrides and plan allowances still apply.</p>
          </div>
        </div>
      </section>

      <div class="mt-5 flex items-center gap-3">
        <button
          type="button"
          :disabled="saving || !dirty"
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          @click="save"
        >
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
        <span v-if="!dirty" class="text-xs text-slate-400">No unsaved changes.</span>
      </div>
    </template>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { aiApi, type AiSettingsResponse } from '@admin/services/aiApi'

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saved = ref(false)
const dirty = ref(false)
const settings = ref<AiSettingsResponse | null>(null)

const draft = reactive({
  enabledFeatures: {} as Record<string, boolean>,
  killSwitch: false,
  defaultModel: 'gemini',
  ragEnabled: false,
  monthlyRequestLimit: null as number | null,
})

const metaFeatures = computed(() =>
  Object.entries(settings.value?.features ?? {}).map(([key, meta]) => ({
    key,
    label: meta.label,
    defaultEnabled: meta.defaultEnabled !== false,
  })),
)

const toggleFeature = (key: string) => {
  draft.enabledFeatures[key] = !draft.enabledFeatures[key]
  dirty.value = true
}

const onLimitInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  draft.monthlyRequestLimit = value === '' ? null : Math.max(0, Number(value) || 0)
  dirty.value = true
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await aiApi.settings()
    settings.value = data
    const defaults = data.defaults ?? {}
    draft.killSwitch = Boolean(defaults.killSwitch)
    draft.defaultModel = defaults.defaultModel || 'gemini'
    draft.ragEnabled = Boolean(defaults.ragEnabled)
    draft.monthlyRequestLimit = defaults.monthlyRequestLimit ?? null
    draft.enabledFeatures = {}
    Object.entries(data.features ?? {}).forEach(([key, meta]) => {
      draft.enabledFeatures[key] =
        typeof defaults.enabledFeatures?.[key] === 'boolean'
          ? Boolean(defaults.enabledFeatures[key])
          : meta.defaultEnabled !== false
    })
    dirty.value = false
  } catch (err) {
    error.value = 'Unable to load AI settings.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    const payload = {
      enabledFeatures: { ...draft.enabledFeatures },
      killSwitch: draft.killSwitch,
      defaultModel: draft.defaultModel.trim() || 'gemini',
      ragEnabled: draft.ragEnabled,
      monthlyRequestLimit: draft.monthlyRequestLimit,
    }
    const result = await aiApi.saveSettings(payload)
    settings.value = { ...(settings.value ?? { defaults: result.defaults, features: {}, updatedAt: null }), defaults: result.defaults }
    dirty.value = false
    saved.value = true
    window.setTimeout(() => {
      saved.value = false
    }, 3000)
  } catch (err) {
    error.value = 'Unable to save AI settings.'
    console.error(err)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>