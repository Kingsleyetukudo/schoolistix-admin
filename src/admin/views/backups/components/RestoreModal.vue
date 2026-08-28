<template>
  <AdminPanelCard title="Restore Modal" description="Recovery confirmation scaffold with target environment and lockout warnings.">
    <p class="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Restore actions should require dual confirmation in production.</p>
    <button class="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Begin Restore</button>
  </AdminPanelCard>
</template>
<script setup lang="ts">import AdminPanelCard from '@admin/components/common/AdminPanelCard.vue'</script>
