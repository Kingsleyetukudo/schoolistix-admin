<template>
  <label class="grid gap-2">
    <span class="text-sm font-medium text-slate-700">{{ label }}</span>
    <input :value="modelValue" :type="type" class="h-11 rounded-2xl border border-slate-200 px-4 text-sm" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label: string; modelValue: string; type?: string }>(), {
  type: 'text',
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
