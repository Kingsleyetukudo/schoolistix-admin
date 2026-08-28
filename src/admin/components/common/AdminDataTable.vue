<template>
  <DataTable
    :columns="columns"
    :data="rows"
    :filters="filters"
    :searchPlaceholder="searchPlaceholder"
    :searchFields="searchFields"
    :itemsPerPage="itemsPerPage"
    :hasActions="hasActions"
    :statusFields="statusFields"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @export="$emit('export', $event)"
  >
    <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from './DataTable.vue'
import type { Column, Filter } from './DataTable.vue'

const props = withDefaults(
  defineProps<{
    columns: Column[];
    rows: any[];
    filters?: Filter[];
    searchPlaceholder?: string;
    searchFields?: string[];
    itemsPerPage?: number;
    hasActions?: boolean;
    statusFields?: string[];
  }>(),
  {
    filters: () => [],
    searchPlaceholder: 'Search...',
    searchFields: () => [],
    itemsPerPage: 10,
    hasActions: false,
    statusFields: () => [],
  },
)

const emit = defineEmits<{
  (e: 'view', row: any): void
  (e: 'edit', row: any): void
  (e: 'delete', row: any): void
  (e: 'export', data: any[]): void
}>()

defineSlots<Record<string, { row: any; value?: unknown }>>()
</script>