<template>
  <AdminPanelCard title="Admin Actions" description="Suspend, activate, impersonate, or grant tester access to this school.">
    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        :disabled="acting"
        @click="loginAs"
      >
        Login As Admin
      </button>
      <button
        v-if="school?.status === 'suspended'"
        type="button"
        class="rounded-lg border border-emerald-700 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
        :disabled="acting"
        @click="activate"
      >
        Activate School
      </button>
      <button
        v-else
        type="button"
        class="rounded-lg border border-rose-700 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
        :disabled="acting"
        @click="suspendOpen = true"
      >
        Suspend School
      </button>
      <button
        type="button"
        class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        :disabled="acting"
        @click="testerOpen = true"
      >
        Grant Tester Access
      </button>
    </div>

    <p v-if="notice" class="mt-4 text-sm font-medium" :class="noticeType === 'error' ? 'text-rose-700' : 'text-emerald-700'">
      {{ notice }}
    </p>

    <AdminConfirmModal
      :open="suspendOpen"
      title="Suspend school?"
      description="Suspending blocks the school from accessing the platform until it is reactivated."
      @cancel="suspendOpen = false"
      @confirm="suspend"
    />

    <div
      v-if="testerOpen"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
      @click.self="testerOpen = false"
    >
      <div class="w-full max-w-md rounded-xl border border-black bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-slate-900">Grant tester access</h3>
        <p class="mt-2 text-sm text-slate-600">
          Activate full-feature access for <span class="font-semibold text-slate-900">{{ school?.name }}</span>.
        </p>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <SearchableDropdownSelect
            label="Plan"
            :model-value="plan"
            :options="planOptions"
            @change="plan = $event"
          />
          <SearchableDropdownSelect
            label="Duration"
            :model-value="String(durationDays)"
            :options="durationOptions"
            @change="durationDays = Number($event)"
          />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-black bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="testerOpen = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            :disabled="isSaving"
            @click="grantTester"
          >
            {{ isSaving ? 'Granting…' : 'Grant Access' }}
          </button>
        </div>
      </div>
    </div>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import AdminConfirmModal from '@admin/components/common/AdminConfirmModal.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { schoolsApi } from '@admin/services/schoolsApi'
import { useSchoolsStore } from '@admin/stores/schools.store'
import type { School } from '@admin/types/school.types'

const props = defineProps<{ school: School | null }>()

const store = useSchoolsStore()
const acting = ref(false)
const suspendOpen = ref(false)
const testerOpen = ref(false)
const isSaving = ref(false)
const plan = ref('professional')
const durationDays = ref(30)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const planOptions = [
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
]

const durationOptions = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
]

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error as string | undefined
    return serverMessage || error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
  notice.value = message
  noticeType.value = type
  window.setTimeout(() => {
    notice.value = ''
  }, 5000)
}

const reload = () => {
  if (props.school?.id) store.fetchSchool(String(props.school.id))
}

const loginAs = async () => {
  const school = props.school
  if (!school || acting.value) return
  acting.value = true
  try {
    await store.loginAsSchool(String(school.id))
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    acting.value = false
  }
}

const suspend = async () => {
  const school = props.school
  if (!school || acting.value) return
  acting.value = true
  suspendOpen.value = false
  try {
    await store.suspendSchool(String(school.id))
    showNotice(`${String(school.name)} has been suspended.`)
    reload()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    acting.value = false
  }
}

const activate = async () => {
  const school = props.school
  if (!school || acting.value) return
  acting.value = true
  try {
    await store.activateSchool(String(school.id))
    showNotice(`${String(school.name)} has been activated.`)
    reload()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    acting.value = false
  }
}

const grantTester = async () => {
  const school = props.school
  if (!school || isSaving.value) return
  isSaving.value = true
  try {
    await schoolsApi.activateTester(String(school.id), {
      plan: plan.value,
      durationDays: Number(durationDays.value),
    })
    showNotice(`Tester access granted to ${String(school.name)}.`)
    testerOpen.value = false
    reload()
  } catch (error) {
    showNotice(errorMessage(error), 'error')
  } finally {
    isSaving.value = false
  }
}
</script>