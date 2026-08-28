<template>
  <AdminPanelCard title="Restoration History" description="Track completed restore operations, rollback notes, and operator decisions.">
    <ul class="space-y-3 text-sm text-slate-600">
      <li class="rounded-2xl bg-slate-50 px-4 py-3">April 20 · Sandbox restore completed by Jane Doe</li>
      <li class="rounded-2xl bg-slate-50 px-4 py-3">March 12 · Pre-release restore simulation completed</li>
    </ul>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
