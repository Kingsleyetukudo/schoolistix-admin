<template>
  <AdminFormInput :label="label" :model-value="modelValue" type="date" @update:model-value="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import AdminFormInput from './AdminFormInput.vue'

defineProps<{ label: string; modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
