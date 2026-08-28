<template>
  <input
    v-model="model"
    type="search"
    :placeholder="placeholder"
    class="h-11 w-full rounded-lg border border-black bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-500"
  />
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: 'Search records...',
})
</script>