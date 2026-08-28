<template>
  <label class="grid gap-2">
    <span class="text-sm font-medium text-slate-700">{{ label }}</span>
    <textarea class="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 text-sm" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
