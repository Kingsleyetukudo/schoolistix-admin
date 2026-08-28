<template>
  <div class="w-full space-y-1 overflow-hidden">
    <p
      class="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
    >
      {{ title }}
    </p>
    <div class="space-y-0.5">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
