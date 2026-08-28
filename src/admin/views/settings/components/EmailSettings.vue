<template>
  <AdminPanelCard title="Email Settings" description="Transactional sender identity, SMTP configuration, and delivery defaults.">
    <div class="grid gap-3 md:grid-cols-2">
      <input class="h-11 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="SMTP host" />
      <input class="h-11 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Sender email" />
    </div>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
