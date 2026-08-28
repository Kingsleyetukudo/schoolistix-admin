<template>
  <AdminFeaturePage
    title="School Detail"
    description="Review a school profile, usage, notes, domains, and quick admin actions."
  >
    <div v-if="store.isLoading" class="rounded-xl border border-black bg-white p-8 text-center text-sm text-slate-500">
      Loading school details…
    </div>
    <div v-else-if="!store.selectedSchool" class="rounded-xl border border-black bg-white p-8 text-center text-sm text-slate-500">
      School not found.
    </div>
    <div v-else class="grid gap-4 xl:grid-cols-2">
      <SchoolInfoCard :school="store.selectedSchool" />
      <SchoolUsageStats :school="store.selectedSchool" />
      <SchoolDomains :school="store.selectedSchool" />
      <SchoolNotes :school="store.selectedSchool" />
      <div class="xl:col-span-2">
        <SchoolActions :school="store.selectedSchool" />
      </div>
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { useSchoolsStore } from '@admin/stores/schools.store'
import SchoolActions from './components/SchoolActions.vue'
import SchoolDomains from './components/SchoolDomains.vue'
import SchoolInfoCard from './components/SchoolInfoCard.vue'
import SchoolNotes from './components/SchoolNotes.vue'
import SchoolUsageStats from './components/SchoolUsageStats.vue'

const route = useRoute()
const store = useSchoolsStore()

const load = () => {
  const id = String(route.params.id ?? '')
  if (id) store.fetchSchool(id)
}

onMounted(load)
watch(() => route.params.id, load)
</script>