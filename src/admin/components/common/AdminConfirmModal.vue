<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
    <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
      <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button class="rounded-full border border-slate-200 px-4 py-2 text-sm" @click="$emit('cancel')">Cancel</button>
        <button class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title: string; description: string }>()
defineEmits<{ cancel: []; confirm: [] }>()
</script>
