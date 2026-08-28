<template>
  <div class="inline-flex items-center gap-3 text-sm text-slate-500">
    <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), {
  label: 'Loading...',
})
</script>
