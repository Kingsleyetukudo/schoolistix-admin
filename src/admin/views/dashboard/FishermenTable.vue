<template>
  <section class="fishermen-table-card">
    <div ref="controlsRoot" class="fishermen-table-card__controls">
      <div class="fishermen-table-card__toolbar">
        <div class="fishermen-table-card__search-group">
          <div class="fishermen-table-card__search">
            <Search class="fishermen-table-card__search-icon" />
            <input
              v-model="searchQuery"
              class="fishermen-table-card__search-input"
              type="text"
              :placeholder="searchPlaceholder"
            />
          </div>
        </div>

        <div class="fishermen-table-card__actions">
          <button
            class="fishermen-table-card__button fishermen-table-card__button--ghost"
            :class="{ 'fishermen-table-card__button--active': showFilterPanel }"
            type="button"
            @click.stop="showFilterPanel = !showFilterPanel"
          >
            <Filter class="fishermen-table-card__button-icon" />
            Filter
          </button>
        </div>

        <button
          class="fishermen-table-card__button fishermen-table-card__button--primary fishermen-table-card__button--export"
          type="button"
          @click="emit('export', filteredRows)"
        >
          <Upload class="fishermen-table-card__button-icon" />
          {{ exportLabel }}
        </button>
      </div>

      <div v-if="showFilterPanel" class="fishermen-table-card__filter-popover">
        <SearchableDropdownSelect
          v-for="filter in filters"
          :key="filter.key"
          v-model="activeFilters[filter.key]"
          :label="filter.label"
          :placeholder="`All ${filter.label.toLowerCase()}`"
          :full-width="true"
          :options="
            filter.options.map((option) => ({ label: option, value: option }))
          "
        />

        <button
          class="fishermen-table-card__button fishermen-table-card__button--ghost fishermen-table-card__button--reset"
          type="button"
          @click="resetFilters"
        >
          Reset filters
        </button>
      </div>
    </div>

    <div class="fishermen-table-card__table-wrap">
      <table class="fishermen-table-card__table">
        <thead>
          <tr>
            <th class="fishermen-table-card__serial-head">No</th>
            <th v-for="column in columns" :key="column.key">
              <button
                v-if="column.sortable !== false"
                type="button"
                class="fishermen-table-card__sort"
                @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <ChevronsUpDown class="fishermen-table-card__sort-icon" />
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
            <th v-if="hasActions">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in paginatedRows" :key="row[idKey] ?? index">
            <td class="fishermen-table-card__serial-cell" data-label="No">
              {{ getRowNumber(index) }}
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :data-label="column.label"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
              >
                <span
                  v-if="column.key === statusField"
                  class="fishermen-table-card__status"
                  :class="statusClass(row[column.key])"
                >
                  {{ row[column.key] }}
                </span>
                <span v-else>
                  {{ formatCellValue(row[column.key]) }}
                </span>
              </slot>
            </td>
            <td
              v-if="hasActions"
              class="fishermen-table-card__actions-cell"
              data-label="Action"
            >
              <TableRowMenu :actions="buildRowActions(row)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="fishermen-table-card__pagination">
      <button
        class="fishermen-table-card__page-button fishermen-table-card__page-button--ghost"
        type="button"
        :disabled="currentPage === 1"
        @click="currentPage = Math.max(1, currentPage - 1)"
      >
        <ChevronLeft class="fishermen-table-card__page-icon" />
        Back
      </button>

      <div class="fishermen-table-card__pages">
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="fishermen-table-card__page-button"
          :class="{
            'fishermen-table-card__page-button--active': page === currentPage,
          }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="fishermen-table-card__page-button fishermen-table-card__page-button--primary"
        type="button"
        :disabled="currentPage === totalPages"
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
      >
        Next
        <ChevronRight class="fishermen-table-card__page-icon" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Edit3,
  Filter,
  Send,
  Search,
  Trash2,
  Upload,
} from "lucide-vue-next";
import SearchableDropdownSelect from "@/admin/components/common/SearchableDropdownSelect.vue";
import TableRowMenu from "@/admin/components/common/TableRowMenu.vue";

type TableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
};

type TableFilter = {
  key: string;
  label: string;
  options: string[];
};

const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    rows: Array<Record<string, any>>;
    filters?: TableFilter[];
    searchPlaceholder?: string;
    searchFields?: string[];
    statusField?: string;
    idKey?: string;
    itemsPerPage?: number;
    exportLabel?: string;
    hasActions?: boolean;
  }>(),
  {
    searchPlaceholder: "Search...",
    searchFields: () => [],
    statusField: "status",
    idKey: "id",
    itemsPerPage: 10,
    exportLabel: "Export",
    hasActions: true,
  },
);

const emit = defineEmits<{
  (e: "export", rows: Array<Record<string, any>>): void;
  (
    e: "row-action",
    payload: {
      action: "edit" | "resend_invite" | "delete";
      row: Record<string, any>;
    },
  ): void;
}>();

const searchQuery = ref("");
const showFilterPanel = ref(false);
const controlsRoot = ref<HTMLElement | null>(null);
const currentPage = ref(1);
const sortKey = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");
const activeFilters = ref<Record<string, string>>({});

const filteredRows = computed(() => {
  let nextRows = [...props.rows];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    const fields =
      props.searchFields.length > 0
        ? props.searchFields
        : props.columns.map((column) => column.key);

    nextRows = nextRows.filter((row) =>
      fields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }

  for (const [key, value] of Object.entries(activeFilters.value)) {
    if (value) {
      nextRows = nextRows.filter((row) => String(row[key] ?? "") === value);
    }
  }

  if (sortKey.value) {
    nextRows.sort((left, right) => {
      const a = left[sortKey.value!];
      const b = right[sortKey.value!];
      const comparison = a > b ? 1 : a < b ? -1 : 0;
      return sortDirection.value === "asc" ? comparison : -comparison;
    });
  }

  return nextRows;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / props.itemsPerPage)),
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  return filteredRows.value.slice(start, start + props.itemsPerPage);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);

  const current = currentPage.value;
  const pages = new Set<number>([1, total]);

  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page > 1 && page < total) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
});

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    return;
  }

  sortKey.value = key;
  sortDirection.value = "asc";
}

function resetFilters() {
  activeFilters.value = {};
  searchQuery.value = "";
  currentPage.value = 1;
}

function statusClass(value: unknown) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("active"))
    return "fishermen-table-card__status--success";
  if (normalized.includes("inactive") || normalized.includes("suspended")) {
    return "fishermen-table-card__status--danger";
  }
  return "fishermen-table-card__status--neutral";
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  return String(value);
}

function getRowNumber(index: number) {
  return (currentPage.value - 1) * props.itemsPerPage + index + 1;
}

function buildRowActions(row: Record<string, any>) {
  return [
    {
      key: "edit",
      label: "Edit Staff Member",
      icon: Edit3,
      onClick: () => emit("row-action", { action: "edit", row }),
    },
    {
      key: "resend",
      label: "Resend Invite",
      icon: Send,
      onClick: () => emit("row-action", { action: "resend_invite", row }),
    },
    {
      key: "delete",
      label: "Delete Staff",
      variant: "danger" as const,
      icon: Trash2,
      onClick: () => emit("row-action", { action: "delete", row }),
    },
  ];
}

function onDocumentClick(event: MouseEvent) {
  if (!controlsRoot.value) return;
  if (!controlsRoot.value.contains(event.target as Node)) {
    showFilterPanel.value = false;
  }
}

watch(
  () => props.rows,
  () => {
    currentPage.value = 1;
  },
);

watch(
  () => [searchQuery.value, activeFilters.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

<style scoped>
.fishermen-table-card {
  display: grid;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 22px;
  border: 1px solid rgba(126, 137, 172, 0.12);
  background: #0f1735;
  color: #d1dbf9;
  box-shadow: none;
}

.fishermen-table-card__controls {
  position: relative;
  display: grid;
  gap: 0.75rem;
}

.fishermen-table-card__toolbar,
.fishermen-table-card__search-group,
.fishermen-table-card__pagination,
.fishermen-table-card__pages {
  display: flex;
  align-items: center;
}

.fishermen-table-card__toolbar {
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
  align-items: center;
}

.fishermen-table-card__search-group {
  flex: 1 1 560px;
  min-width: 0;
}

.fishermen-table-card__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 0 0 auto;
}

.fishermen-table-card__search {
  position: relative;
  width: min(100%, 280px);
}

.fishermen-table-card__search-icon {
  position: absolute;
  top: 50%;
  left: 0.9rem;
  width: 1rem;
  height: 1rem;
  transform: translateY(-50%);
  color: #6b7280;
}

.fishermen-table-card__search-input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.9rem 0 2.4rem;
  border: 1px solid rgba(126, 137, 172, 0.18);
  border-radius: 12px;
  background: #111b3d;
  color: #ffffff;
  outline: none;
}

.fishermen-table-card__button,
.fishermen-table-card__page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  height: 2.5rem;
  border-radius: 14px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease,
    background 160ms ease;
}

.fishermen-table-card__button:hover,
.fishermen-table-card__page-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.fishermen-table-card__button--active {
  border-color: rgba(91, 94, 247, 0.6);
  box-shadow: 0 0 0 3px rgba(91, 94, 247, 0.12);
}

.fishermen-table-card__button--ghost,
.fishermen-table-card__page-button--ghost {
  padding: 0 1rem;
  background: #111b3d;
  color: #d1dbf9;
  border-color: rgba(126, 137, 172, 0.18);
}

.fishermen-table-card__button--primary,
.fishermen-table-card__page-button--primary {
  padding: 0 1rem;
  background: linear-gradient(135deg, #2a13e8, #5b5ef7);
  color: #ffffff;
}

.fishermen-table-card__button--reset {
  width: 100%;
}

.fishermen-table-card__button-icon,
.fishermen-table-card__page-icon,
.fishermen-table-card__sort-icon {
  width: 1rem;
  height: 1rem;
}

.fishermen-table-card__filter-popover {
  position: absolute;
  top: calc(100% + 0.55rem);
  left: 0;
  z-index: 20;
  display: grid;
  gap: 0.85rem;
  width: min(300px, 100%);
  max-width: 100%;
  padding: 0.85rem;
  border-radius: 18px;
  border: 1px solid rgba(126, 137, 172, 0.16);
  background: #0f1735;
  box-shadow: none;
}

.fishermen-table-card__table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(126, 137, 172, 0.16);
  border-radius: 16px;
  background: #0f1735;
}

.fishermen-table-card__table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.fishermen-table-card__table th,
.fishermen-table-card__table td {
  padding: 0.75rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid rgba(126, 137, 172, 0.12);
  white-space: nowrap;
  vertical-align: middle;
}

.fishermen-table-card__serial-head,
.fishermen-table-card__serial-cell {
  width: 58px;
  text-align: center;
}

.fishermen-table-card__table th:nth-child(2),
.fishermen-table-card__table td:nth-child(2) {
  min-width: 170px;
}

.fishermen-table-card__table th:nth-child(3),
.fishermen-table-card__table td:nth-child(3) {
  min-width: 130px;
}

.fishermen-table-card__table th:nth-child(4),
.fishermen-table-card__table td:nth-child(4) {
  min-width: 150px;
}

.fishermen-table-card__table th:nth-last-child(2),
.fishermen-table-card__table td:nth-last-child(2) {
  min-width: 110px;
}

.fishermen-table-card__actions-cell {
  min-width: 92px;
}

.fishermen-table-card__table th:last-child,
.fishermen-table-card__table td:last-child {
  text-align: center;
}

.fishermen-table-card__table th {
  background: #111b3d;
  color: #aeb9e1;
  font-size: 0.82rem;
  font-weight: 600;
}

.fishermen-table-card__table td {
  font-size: 0.85rem;
  color: #d1dbf9;
}

.fishermen-table-card__table tbody tr:hover {
  background: #111b3d;
}

.fishermen-table-card__sort {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.fishermen-table-card__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.fishermen-table-card__status--success {
  background: rgba(34, 197, 94, 0.16);
  color: #22c55e;
}

.fishermen-table-card__status--danger {
  background: rgba(239, 68, 68, 0.16);
  color: #ef4444;
}

.fishermen-table-card__status--neutral {
  background: rgba(126, 137, 172, 0.16);
  color: #aeb9e1;
}

.fishermen-table-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #d1dbf9;
  cursor: pointer;
}

.fishermen-table-card__actions-cell {
  text-align: center;
}

.fishermen-table-card__pagination {
  /* justify-content: space-between; */
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.35rem;
}

.fishermen-table-card__pages {
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1 1 auto;
}

.fishermen-table-card__page-button {
  min-width: 2.5rem;
  padding: 0 0.85rem;
}

.fishermen-table-card__page-button--ghost,
.fishermen-table-card__page-button--primary {
  min-width: 6.25rem;
}

.fishermen-table-card__page-button--ghost {
  justify-content: center;
}

.fishermen-table-card__page-button--primary {
  justify-content: center;
}

.fishermen-table-card__page-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fishermen-table-card__page-button--active {
  background: #2a13e8;
  color: #ffffff;
  border-color: #2a13e8;
}

@media (max-width: 768px) {
  .fishermen-table-card {
    gap: 0.7rem;
    padding: 0.65rem;
  }

  .fishermen-table-card__toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      "search search"
      "actions export";
    gap: 0.55rem;
  }

  .fishermen-table-card__search-group {
    grid-area: search;
    display: block;
    width: 100%;
    flex: none;
  }

  .fishermen-table-card__search {
    width: 100%;
  }

  .fishermen-table-card__actions {
    grid-area: actions;
    display: flex;
    gap: 0.55rem;
    width: 100%;
  }

  .fishermen-table-card__button {
    width: 100%;
    flex: none;
  }

  .fishermen-table-card__button--export {
    grid-area: export;
  }

  .fishermen-table-card__pagination {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.35rem 0.45rem;
    align-items: center;
  }

  .fishermen-table-card__pages {
    grid-column: 2;
    justify-content: center;
    gap: 0.35rem;
  }

  .fishermen-table-card__page-button {
    min-width: 0;
    width: auto;
    padding: 0 0.7rem;
  }

  .fishermen-table-card__page-button--ghost,
  .fishermen-table-card__page-button--primary {
    min-width: 0;
  }

  .fishermen-table-card__filter-popover {
    width: 100%;
  }

  .fishermen-table-card__table-wrap {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }

  .fishermen-table-card__table {
    min-width: 920px;
  }
}
</style>
