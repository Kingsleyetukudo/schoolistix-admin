<template>
  <AdminPanelCard title="Backup Settings" description="Retention policy, backup cadence, alert recipients, and storage destination controls.">
    <div class="space-y-3">
      <select class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm"><option>Daily</option><option>Hourly</option></select>
      <select class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm"><option>Keep 30 days</option><option>Keep 90 days</option></select>
      <input class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm" placeholder="alerts@schoolistix.com" />
    </div>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
