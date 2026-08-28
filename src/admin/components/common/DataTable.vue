<!-- Light, simple data table with search, searchable filters, sorting, and pagination. -->
<template>
  <div class="data-table-container">
    <!-- Header with Search and Actions -->
    <div class="data-table__header">
      <div class="data-table__search-area">
        <div class="data-table__search">
          <svg
            class="data-table__search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="data-table__search-input"
            @input="onSearch"
          />
        </div>

        <button
          v-if="filters.length"
          class="data-table__filter-btn"
          @click="toggleFilterPanel"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter
        </button>
      </div>

      <div class="data-table__actions">
        <button class="data-table__export-btn" @click="exportData">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Filter Panel (searchable dropdown selects) -->
    <div v-if="showFilterPanel && filters.length" class="data-table__filter-panel">
      <div class="data-table__filter-panel-head">
        <span class="data-table__filter-title">Filter by</span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="data-table__filter-reset"
          @click="resetFilters"
        >
          Clear all filters
        </button>
      </div>
      <div class="data-table__filter-groups">
        <div
          v-for="filter in filters"
          :key="filter.key"
          class="data-table__filter-group"
        >
          <span class="data-table__filter-label">{{ filter.label }}</span>
          <SearchableDropdownSelect
            :label="filter.label"
            :model-value="activeFilters[filter.key] ?? ''"
            :options="filter.options.map((option) => ({ label: humanize(option), value: option }))"
            placeholder="All"
            search-placeholder="Search options..."
            full-width
            @change="onFilterChange(filter.key, $event)"
          />
        </div>
      </div>
      <div v-if="hasActiveFilters" class="data-table__active-filters">
        <template v-for="filter in filters" :key="filter.key">
          <span v-if="activeFilters[filter.key]" class="data-table__chip">
            <span class="data-table__chip-label">{{ filter.label }}:</span>
            <span class="data-table__chip-value">{{ humanize(activeFilters[filter.key]) }}</span>
            <button
              type="button"
              class="data-table__chip-clear"
              :aria-label="`Clear ${filter.label} filter`"
              @click="clearFilter(filter.key)"
            >
              &times;
            </button>
          </span>
        </template>
      </div>
    </div>

    <!-- Table -->
    <div class="data-table__wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="data-table__th"
            >
              {{ column.label }}
              <button
                v-if="column.sortable !== false"
                class="data-table__sort-btn"
                @click="sort(column.key)"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </th>
            <th v-if="hasActions" class="data-table__th">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            class="data-table__row"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="data-table__td"
            >
              <slot
                :name="`column-${column.key}`"
                :row="row"
                :value="row[column.key]"
              >
                <span :class="getStatusClass(row, column)">
                  {{ formatValue(row[column.key], column) }}
                </span>
              </slot>
            </td>
            <td
              v-if="hasActions"
              class="data-table__td data-table__actions-cell"
            >
              <slot name="actions" :row="row">
                <button
                  class="data-table__action-btn"
                  @click="$emit('view', row)"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  class="data-table__action-btn"
                  @click="$emit('edit', row)"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  class="data-table__action-btn data-table__action-btn--danger"
                  @click="$emit('delete', row)"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </slot>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0" class="data-table__empty-row">
            <td
              :colspan="columns.length + (hasActions ? 1 : 0)"
              class="data-table__empty-cell"
            >
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="data-table__pagination">
      <div class="data-table__pagination-info">
        Showing {{ startIndex }} to {{ endIndex }} of {{ filteredData.length }} entries
      </div>
      <div class="data-table__pagination-controls">
        <button
          class="data-table__pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          &laquo;
        </button>
        <button
          class="data-table__pagination-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          &lsaquo;
        </button>

        <div class="data-table__pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="data-table__pagination-page"
            :class="{
              'data-table__pagination-page--active': currentPage === page,
            }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-if="showEllipsisEnd" class="data-table__pagination-ellipsis">...</span>
          <button
            v-if="totalPages > 5 && currentPage < totalPages - 2"
            class="data-table__pagination-page"
            @click="goToPage(totalPages)"
          >
            {{ totalPages }}
          </button>
        </div>

        <button
          class="data-table__pagination-btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          &rsaquo;
        </button>
        <button
          class="data-table__pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import SearchableDropdownSelect from "./SearchableDropdownSelect.vue";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  format?: (value: any) => string;
  statusMap?: Record<string, string>;
}

export interface Filter {
  key: string;
  label: string;
  options: string[];
}

const props = withDefaults(
  defineProps<{
    columns: Column[];
    data: any[];
    filters?: Filter[];
    searchPlaceholder?: string;
    searchFields?: string[];
    itemsPerPage?: number;
    hasActions?: boolean;
    statusFields?: string[];
  }>(),
  {
    filters: () => [],
    searchPlaceholder: "Search...",
    searchFields: () => [],
    itemsPerPage: 10,
    hasActions: false,
    statusFields: () => [],
  },
);

const emit = defineEmits<{
  (e: "view", row: any): void;
  (e: "edit", row: any): void;
  (e: "delete", row: any): void;
  (e: "export", data: any[]): void;
}>();

// State
const searchQuery = ref("");
const showFilterPanel = ref(false);
const activeFilters = ref<Record<string, string>>({});
const sortKey = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");
const currentPage = ref(1);

const filteredData = computed(() => {
  let result = [...props.data];
  const query = searchQuery.value.trim().toLowerCase();

  if (query) {
    const fields = props.searchFields.length
      ? props.searchFields
      : props.columns.map((column) => column.key);
    result = result.filter((row) =>
      fields.some((key) => String(row[key] ?? "").toLowerCase().includes(query)),
    );
  }

  Object.entries(activeFilters.value).forEach(([key, value]) => {
    if (value) {
      result = result.filter((row) => String(row[key]) === String(value));
    }
  });

  if (sortKey.value) {
    const key = sortKey.value;
    const direction = sortDirection.value === "asc" ? 1 : -1;
    result = [...result].sort((left, right) => {
      const a = left[key];
      const b = right[key];
      if (a === null || a === undefined) return 1;
      if (b === null || b === undefined) return -1;
      return (
        String(a).localeCompare(String(b), undefined, { numeric: true }) * direction
      );
    });
  }

  return result;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / props.itemsPerPage)),
);

const safePage = computed(() => Math.min(currentPage.value, totalPages.value));

const paginatedData = computed(() => {
  const start = (safePage.value - 1) * props.itemsPerPage;
  return filteredData.value.slice(start, start + props.itemsPerPage);
});

const startIndex = computed(() =>
  filteredData.value.length ? (safePage.value - 1) * props.itemsPerPage + 1 : 0,
);

const endIndex = computed(() =>
  Math.min(startIndex.value + props.itemsPerPage - 1, filteredData.value.length),
);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = safePage.value;
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
});

const showEllipsisEnd = computed(
  () => totalPages.value > 5 && safePage.value < totalPages.value - 2,
);

// Methods
const onSearch = () => {
  currentPage.value = 1;
};

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value;
};

const onFilterChange = (key: string, value: string) => {
  activeFilters.value = { ...activeFilters.value, [key]: value };
  currentPage.value = 1;
};

const resetFilters = () => {
  activeFilters.value = {};
  searchQuery.value = "";
  currentPage.value = 1;
};

const clearFilter = (key: string) => {
  activeFilters.value = { ...activeFilters.value, [key]: "" };
  currentPage.value = 1;
};

const hasActiveFilters = computed(
  () => Object.values(activeFilters.value).some(Boolean),
);

const humanize = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const sort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
};

const exportData = () => {
  emit("export", filteredData.value);
};

const formatValue = (value: any, column: Column) => {
  if (column.format) return column.format(value);
  if (value === undefined || value === null) return "-";
  return value;
};

const getStatusClass = (row: any, column: Column) => {
  if (props.statusFields?.includes(column.key)) {
    const value = row[column.key];
    const statusClass = column.statusMap?.[value] || value?.toLowerCase();
    return `data-table__status data-table__status--${statusClass}`;
  }
  return "";
};

watch(
  () => props.data,
  () => {
    currentPage.value = 1;
  },
);
</script>

<style scoped>
.data-table-container {
  width: 100%;
}

.data-table__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.data-table__search-area {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.data-table__search {
  position: relative;
  display: flex;
  align-items: center;
}

.data-table__search-icon {
  position: absolute;
  left: 0.9rem;
  width: 1rem;
  height: 1rem;
  color: #777777;
}

.data-table__search-input {
  padding: 0.7rem 1rem 0.7rem 2.6rem;
  width: 280px;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 0.75rem;
  color: #111111;
  font-size: 0.9rem;
  outline: none;
}

.data-table__search-input:focus {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}

.data-table__search-input::placeholder {
  color: #999999;
}

.data-table__filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 0.75rem;
  color: #111111;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.data-table__filter-btn:hover {
  background: #f5f5f5;
}

.data-table__actions {
  display: flex;
  gap: 0.75rem;
}

.data-table__export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.1rem;
  background: #111111;
  border: 1px solid #000000;
  border-radius: 0.75rem;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.data-table__export-btn:hover {
  background: #333333;
}

.data-table__filter-panel {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #000000;
  border-radius: 0.9rem;
  background: #ffffff;
}

.data-table__filter-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.data-table__filter-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #555555;
}

.data-table__filter-groups {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.data-table__filter-group {
  flex: 1;
  min-width: 190px;
}

.data-table__filter-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #555555;
}

.data-table__active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid #000000;
}

.data-table__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid #000000;
  border-radius: 999px;
  background: #f5f5f5;
  font-size: 0.75rem;
  font-weight: 600;
  color: #111111;
}

.data-table__chip-label {
  color: #777777;
}

.data-table__chip-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #555555;
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
}

.data-table__chip-clear:hover {
  background: #e5e5e5;
  color: #111111;
}

.data-table__filter-reset {
  padding: 0.55rem 1rem;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 0.6rem;
  color: #111111;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.data-table__filter-reset:hover {
  background: #f5f5f5;
}

.data-table__wrapper {
  overflow-x: auto;
  border: 1px solid #000000;
  border-radius: 0.9rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.data-table__th {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #000000;
  background: #fafafa;
  color: #333333;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  white-space: nowrap;
}

.data-table__sort-btn {
  margin-left: 0.25rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: #777777;
  cursor: pointer;
  vertical-align: middle;
}

.data-table__td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #000000;
  color: #111111;
  vertical-align: middle;
}

.data-table__row:last-child .data-table__td {
  border-bottom: 0;
}

.data-table__row:hover .data-table__td {
  background: #f5f5f5;
}

.data-table__actions-cell {
  text-align: right;
  white-space: nowrap;
}

.data-table__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-left: 0.35rem;
  border: 1px solid #000000;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #333333;
  cursor: pointer;
}

.data-table__action-btn:hover {
  background: #f0f0f0;
}

.data-table__action-btn--danger:hover {
  color: #be123c;
}

.data-table__empty-row .data-table__empty-cell {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #777777;
  border-bottom: 0;
}

.data-table__status {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 0.65rem;
  border: 1px solid #000000;
  border-radius: 999px;
  background: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.data-table__status--active,
.data-table__status--paid,
.data-table__status--success,
.data-table__status--approved,
.data-table__status--completed,
.data-table__status--healthy {
  color: #166534;
}

.data-table__status--pending,
.data-table__status--trial,
.data-table__status--past_due,
.data-table__status--degraded,
.data-table__status--warning {
  color: #b45309;
}

.data-table__status--failed,
.data-table__status--cancelled,
.data-table__status--suspended,
.data-table__status--expired,
.data-table__status--error,
.data-table__status--offline {
  color: #be123c;
}

.data-table__pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.data-table__pagination-info {
  color: #555555;
  font-size: 0.85rem;
}

.data-table__pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.data-table__pagination-btn,
.data-table__pagination-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.1rem;
  height: 2.1rem;
  padding: 0 0.5rem;
  border: 1px solid #000000;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #111111;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.data-table__pagination-btn:hover:not(:disabled),
.data-table__pagination-page:hover {
  background: #f0f0f0;
}

.data-table__pagination-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.data-table__pagination-page--active {
  background: #111111;
  color: #ffffff;
}

.data-table__pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.data-table__pagination-ellipsis {
  padding: 0 0.25rem;
  color: #777777;
}
</style>