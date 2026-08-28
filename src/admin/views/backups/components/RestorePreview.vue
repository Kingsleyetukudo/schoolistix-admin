<template>
  <AdminPanelCard title="Restore Preview" description="Preview impacted schools, time window, and validation checks before restore.">
    <ul class="space-y-3 text-sm text-slate-600">
      <li>Target snapshot: nightly-2026-05-20</li>
      <li>Estimated downtime: 8 minutes</li>
      <li>Validation checks: schema, queue state, tenant index</li>
    </ul>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
