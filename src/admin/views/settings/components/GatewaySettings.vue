<template>
  <AdminPanelCard title="Gateway Settings" description="Payment gateway keys, webhook health, and billing retry policy controls.">
    <div class="space-y-3">
      <input class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Public key" />
      <input class="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Secret key" />
    </div>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
