<template>
  <AdminPanelCard title="Branding Settings" description="Admin-facing logos, theme accents, and white-label controls for tenants.">
    <div class="space-y-3">
      <input class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Primary color" />
      <input class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Upload logo URL" />
    </div>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
