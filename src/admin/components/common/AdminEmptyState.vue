<template>
  <div class="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center">
    <p class="text-base font-semibold text-slate-900">{{ title }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'Nothing to show yet',
    description: 'Data will appear here as soon as records are available.',
  },
)
</script>
