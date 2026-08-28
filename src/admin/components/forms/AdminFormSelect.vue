<template>
  <label class="grid gap-2">
    <span class="text-sm font-medium text-slate-700">{{ label }}</span>
    <select class="h-11 rounded-2xl border border-slate-200 px-4 text-sm" :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: string; options: Array<{ label: string; value: string }> }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
