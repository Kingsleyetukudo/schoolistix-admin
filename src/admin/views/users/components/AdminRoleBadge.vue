<template>
  <AdminStatusBadge :status="role" />
</template>

<script setup lang="ts">
import AdminStatusBadge from "@admin/components/common/AdminStatusBadge.vue";

defineProps<{ role: string }>();
</script>
