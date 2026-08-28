<template>
  <AdminPanelCard title="Custom Domains" description="Custom domains attached to this tenant.">
    <ul v-if="domains.length" class="space-y-3 text-sm text-slate-700">
      <li
        v-for="domain in domains"
        :key="String(domain.id ?? domain.domain ?? domain.host ?? '')"
        class="flex items-center justify-between rounded-lg border border-black bg-white px-4 py-3"
      >
        <span>{{ String(domain.domain ?? domain.host ?? '') }}</span>
        <span class="text-xs font-semibold text-emerald-700">
          {{ domain.verified_at ? 'VERIFIED' : String(domain.ssl_status ?? domain.status ?? 'CONFIGURED').toUpperCase() }}
        </span>
      </li>
    </ul>
    <p v-else class="rounded-lg border border-black/20 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      No custom domains configured for this school.
    </p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'
import type { School } from '@admin/types/school.types'

const props = defineProps<{ school: School | null }>()

const domains = computed(() => {
  const raw = props.school?.custom_domains ?? props.school?.domains
  if (Array.isArray(raw)) return raw as Array<Record<string, unknown>>
  if (typeof raw === 'string' && raw.trim()) return [{ domain: raw }]
  return []
})
</script>