<template>
  <div class="revenue-chart-header">
    <div class="revenue-chart-header__row">
      <div class="revenue-chart-header__metric">
        <strong>{{ value }}</strong>
        <span class="revenue-chart-header__trend">{{ trend }}</span>
      </div>

      <div class="revenue-chart-header__legend">
        <span
          v-for="item in legend"
          :key="item.label"
          class="revenue-chart-header__legend-item"
        >
          <i
            class="revenue-chart-header__dot"
            :style="{ background: item.color }"
          ></i>
          {{ item.label }}
        </span>
      </div>

      <div class="revenue-chart-header__filter">
        <SearchableDropdownSelect
          v-model="selectedValue"
          label="Filter"
          :placeholder="filterPlaceholder"
          :search-placeholder="searchPlaceholder"
          :compact="true"
          menu-align="end"
          :options="
            filterOptions.map((option) => ({ label: option, value: option }))
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SearchableDropdownSelect from "@/admin/components/common/SearchableDropdownSelect.vue";

type LegendItem = {
  label: string;
  color: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    value: string;
    trend: string;
    legend: LegendItem[];
    filterOptions: string[];
    filterPlaceholder?: string;
    searchPlaceholder?: string;
  }>(),
  {
    filterPlaceholder: "Select range",
    searchPlaceholder: "Search ranges...",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});
</script>

<style scoped>
.revenue-chart-header {
  display: grid;
  gap: 0.45rem;
}

.revenue-chart-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  flex-wrap: nowrap;
}

.revenue-chart-header__metric {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.revenue-chart-header__metric strong {
  color: #ffffff;
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  font-weight: 800;
  line-height: 1;
}

.revenue-chart-header__trend {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.25rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #22c55e;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.revenue-chart-header__legend {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  flex-wrap: nowrap;
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.revenue-chart-header__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #aeb9e1;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.revenue-chart-header__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  flex-shrink: 0;
}

.revenue-chart-header__filter {
  margin-left: 0;
  flex: 0 0 auto;
}

@media (max-width: 768px) {
  .revenue-chart-header__row {
    flex-direction: column;
    align-items: stretch;
    flex-wrap: wrap;
  }

  .revenue-chart-header__legend,
  .revenue-chart-header__filter {
    width: 100%;
    margin-left: 0;
  }

  .revenue-chart-header__legend {
    justify-content: flex-start;
  }
}
</style>
