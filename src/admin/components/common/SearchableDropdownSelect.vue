<template>
  <div
    ref="root"
    class="searchable-dropdown"
    @keydown.esc="close"
    :class="{ 'searchable-dropdown--full': fullWidth }"
  >
    <button
      type="button"
      class="searchable-dropdown__trigger"
      :class="{
        'searchable-dropdown__trigger--open': open,
        'searchable-dropdown__trigger--compact': compact,
        'searchable-dropdown__trigger--full': fullWidth,
      }"
      :aria-label="label"
      @click="toggle"
    >
      <template v-if="!compact">
        <span class="searchable-dropdown__label">{{ label }}</span>
        <span class="searchable-dropdown__value">
          {{ selectedOption?.label ?? placeholder }}
        </span>
      </template>
      <span v-else class="searchable-dropdown__value searchable-dropdown__value--compact">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <ChevronDown class="searchable-dropdown__icon" />
    </button>

    <div
      v-if="open"
      class="searchable-dropdown__menu"
      :class="{ 'searchable-dropdown__menu--end': menuAlign === 'end' }"
    >
      <div class="searchable-dropdown__search">
        <Search class="searchable-dropdown__search-icon" />
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          class="searchable-dropdown__search-input"
          :placeholder="searchPlaceholder"
        />
      </div>

      <div class="searchable-dropdown__options">
      <button
        v-for="option in filteredOptions"
        :key="option.value"
        type="button"
        class="searchable-dropdown__option"
        :class="{ 'searchable-dropdown__option--active': option.value === modelValue }"
        @click="selectOption(option.value)"
      >
        <span>{{ option.label }}</span>
        <Check v-if="option.value === modelValue" class="searchable-dropdown__check" />
      </button>

      <button
        type="button"
        class="searchable-dropdown__clear"
        @click="selectOption('')"
      >
        Clear selection
      </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ChevronDown, Check, Search } from "lucide-vue-next";

type DropdownOption = {
  label: string;
  value: string;
};

const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    options: DropdownOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    compact?: boolean;
    menuAlign?: "start" | "end";
    fullWidth?: boolean;
  }>(),
  {
    placeholder: "Select",
    searchPlaceholder: "Search options...",
    compact: false,
    menuAlign: "start",
    fullWidth: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const root = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref("");

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
);

const filteredOptions = computed(() => {
  const value = query.value.trim().toLowerCase();
  if (!value) return props.options;
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(value) ||
      option.value.toLowerCase().includes(value),
  );
});

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
  query.value = "";
}

function selectOption(value: string) {
  emit("update:modelValue", value);
  emit("change", value);
  close();
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value) return;
  if (!root.value.contains(event.target as Node)) {
    close();
  }
}

watch(open, (value) => {
  if (value) {
    queueMicrotask(() => searchInput.value?.focus());
  }
});

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

<style scoped>
.searchable-dropdown {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 100%;
}

.searchable-dropdown--full {
  display: block;
  width: 100%;
}

.searchable-dropdown__trigger {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.2rem 0.75rem;
  width: fit-content;
  max-width: 100%;
  min-height: 44px;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #111111;
  cursor: pointer;
  text-align: left;
}

.searchable-dropdown__trigger--compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: auto;
  min-width: 0;
}

.searchable-dropdown__trigger--full {
  width: 100%;
}

.searchable-dropdown__trigger--open {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.searchable-dropdown__label {
  grid-column: 1 / 2;
  font-size: 0.7rem;
  font-weight: 700;
  color: #555555;
}

.searchable-dropdown__value {
  grid-column: 1 / 2;
  font-size: 0.85rem;
  font-weight: 700;
  color: #111111;
}

.searchable-dropdown__value--compact {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.searchable-dropdown__icon {
  grid-row: 1 / span 2;
  grid-column: 2 / 3;
  width: 1rem;
  height: 1rem;
  color: #555555;
}

.searchable-dropdown__trigger--compact .searchable-dropdown__icon {
  grid-row: auto;
  grid-column: auto;
  flex-shrink: 0;
}

.searchable-dropdown__menu {
  position: absolute;
  z-index: 999;
  top: calc(100% + 0.5rem);
  left: 0;
  width: fit-content;
  min-width: 100%;
  max-width: min(320px, 90vw);
  padding: 0.75rem;
  border-radius: 14px;
  border: 1px solid #000000;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
}


.searchable-dropdown__menu--end {
  left: auto;
  right: 0;
}

.searchable-dropdown__trigger--full + .searchable-dropdown__menu {
  width: 100%;
  min-width: 100%;
  max-width: 100%;
}

.searchable-dropdown__options {
  max-height: 15rem;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.searchable-dropdown__search {
  position: relative;
  margin-bottom: 0.65rem;
}

.searchable-dropdown__search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  width: 0.95rem;
  height: 0.95rem;
  transform: translateY(-50%);
  color: #777777;
}

.searchable-dropdown__search-input {
  width: 100%;
  min-width: 14rem;
  height: 2.5rem;
  padding: 0 0.75rem 0 2.15rem;
  border-radius: 10px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #111111;
  outline: none;
}

.searchable-dropdown__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.72rem 0.6rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #111111;
  text-align: left;
  cursor: pointer;
}

.searchable-dropdown__option:hover {
  background: #f5f5f5;
}

.searchable-dropdown__option--active {
  background: #111111;
  color: #ffffff;
}

.searchable-dropdown__check {
  width: 0.95rem;
  height: 0.95rem;
  color: #ffffff;
}

.searchable-dropdown__clear {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.65rem 0.6rem 0.35rem;
  border: 0;
  background: transparent;
  color: #777777;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

@media (max-width: 768px) {
  .searchable-dropdown {
    width: 100%;
  }

  .searchable-dropdown__trigger--compact {
    width: 100%;
    min-width: 0;
  }

  .searchable-dropdown__menu {
    width: 100%;
    max-width: 100%;
  }
}
</style>