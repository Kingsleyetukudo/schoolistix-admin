<template>
  <AdminPanelCard title="Internal Notes" description="Private notes attached to this school by the admin team.">
    <p v-if="currentNotes" class="whitespace-pre-wrap rounded-lg border border-black bg-white px-4 py-3 text-sm text-slate-700">
      {{ currentNotes }}
    </p>
    <p v-else class="rounded-lg border border-black/20 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      No internal notes yet.
    </p>
    <form class="mt-4 flex gap-2" @submit.prevent="saveNote">
      <input
        v-model="draft"
        type="text"
        class="h-10 min-w-0 flex-1 rounded-lg border border-black bg-white px-3 text-sm outline-none"
        placeholder="Add an internal note…"
      />
      <button
        type="submit"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="!draft.trim() || saving"
      >
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </form>
    <p v-if="savedMessage" class="mt-2 text-xs font-medium text-emerald-700">{{ savedMessage }}</p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import { schoolsApi } from '@admin/services/schoolsApi'
import { useSchoolsStore } from '@admin/stores/schools.store'
import type { School } from '@admin/types/school.types'

const props = defineProps<{ school: School | null }>()

const store = useSchoolsStore()
const draft = ref('')
const saving = ref(false)
const savedMessage = ref('')

const currentNotes = computed(() => {
  const raw = props.school?.internal_notes ?? props.school?.notes
  if (typeof raw === 'string') return raw.trim() || ''
  if (Array.isArray(raw)) {
    return raw
      .map((note) => {
        const item = note as Record<string, unknown>
        return String(item.note ?? item.body ?? item.content ?? '')
      })
      .filter(Boolean)
      .join('\n')
  }
  return ''
})

const saveNote = async () => {
  const school = props.school
  if (!school || !draft.value.trim() || saving.value) return
  saving.value = true
  savedMessage.value = ''
  try {
    await schoolsApi.saveNote(String(school.id), draft.value.trim())
    draft.value = ''
    savedMessage.value = 'Note saved.'
    if (school.id) await store.fetchSchool(String(school.id))
    window.setTimeout(() => {
      savedMessage.value = ''
    }, 4000)
  } finally {
    saving.value = false
  }
}
</script>