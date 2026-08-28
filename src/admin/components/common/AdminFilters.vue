<template>
  <div class="flex flex-wrap gap-3">
    <label v-for="filter in filters" :key="filter.key" class="min-w-[10rem]">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {{ filter.label }}
      </span>
      <select
        :value="modelValue[filter.key] ?? ''"
        class="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        @change="$emit('update:modelValue', { ...modelValue, [filter.key]: ($event.target as HTMLSelectElement).value })"
      >
        <option value="">All</option>
        <option v-for="option in filter.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: Record<string, string>
  filters: Array<{ key: string; label: string; options: Array<{ label: string; value: string }> }>
}>()

defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()
</script>
