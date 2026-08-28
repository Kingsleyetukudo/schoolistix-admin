<template>
  <AdminPanelCard title="Bypass Settings" description="Roles, emails, and IP ranges that can access the platform during maintenance.">
    <div v-if="roles.length || emails.length || ips.length" class="space-y-4">
      <div v-if="roles.length">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="role in roles" :key="role" class="rounded-full border border-black bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {{ role }}
          </span>
        </div>
      </div>
      <div v-if="emails.length">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Emails</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="email in emails" :key="email" class="rounded-full border border-black bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {{ email }}
          </span>
        </div>
      </div>
      <div v-if="ips.length">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">IP Addresses</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="ip in ips" :key="ip" class="rounded-full border border-black bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {{ ip }}
          </span>
        </div>
      </div>
    </div>
    <p v-else class="rounded-lg border border-black/20 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      No bypass rules configured.
    </p>
  </AdminPanelCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'

const props = defineProps<{ settings: Record<string, unknown> }>()

const roles = computed(() => asList(props.settings.bypass_roles))
const emails = computed(() => asList(props.settings.bypass_emails))
const ips = computed(() => asList(props.settings.bypass_ips))

const asList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}
</script>