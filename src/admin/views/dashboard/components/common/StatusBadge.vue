<template>
  <span class="status-pill" :class="`status-pill--${variant}`">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant: "success" | "warning" | "danger" | "default";
  text: string;
}>();
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border-radius: 999px;
  padding: 0 0.7rem;
  border: 1px solid transparent;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-pill--success {
  background: rgba(55, 195, 255, 0.12);
  border-color: rgba(55, 195, 255, 0.16);
  color: #b8efff;
}

.status-pill--warning {
  background: rgba(253, 181, 42, 0.12);
  border-color: rgba(253, 181, 42, 0.16);
  color: #ffe4a2;
}

.status-pill--danger {
  background: rgba(255, 94, 168, 0.12);
  border-color: rgba(255, 94, 168, 0.16);
  color: #ffc2e0;
}

.status-pill--default {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: #d1dbf9;
}
</style>
