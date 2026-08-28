<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="action in actions"
      :key="action.label"
      type="button"
      class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
      @click="action.onClick"
    >
      {{ action.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  actions: Array<{ label: string; onClick: () => void }>
}>()
</script>
