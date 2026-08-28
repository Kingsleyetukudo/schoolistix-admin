<template>
  <AdminPanelCard title="Backup List" description="Recent snapshots, retention labels, verification status, and backup size details.">
    <ul class="space-y-3 text-sm text-slate-600">
      <li class="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>nightly-2026-05-20</span><span>860 MB</span></li>
      <li class="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>nightly-2026-05-19</span><span>854 MB</span></li>
    </ul>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
