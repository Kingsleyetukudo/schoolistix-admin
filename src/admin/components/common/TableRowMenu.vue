<template>
  <div ref="root" class="table-row-menu">
    <button
      type="button"
      class="table-row-menu__trigger"
      aria-label="Open row actions"
      @click="toggle"
    >
      <MoreHorizontal class="table-row-menu__trigger-icon" />
    </button>

    <div v-if="open" class="table-row-menu__panel">
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        class="table-row-menu__item"
        :class="`table-row-menu__item--${action.variant ?? 'default'}`"
        @click="runAction(action)"
      >
        <span class="table-row-menu__item-copy">
          <component :is="action.icon" class="table-row-menu__item-icon" />
          {{ action.label }}
        </span>
        <ChevronRight class="table-row-menu__arrow" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ChevronRight, MoreHorizontal } from "lucide-vue-next";

type MenuAction = {
  key: string;
  label: string;
  variant?: "default" | "danger";
  icon?: any;
  onClick: () => void;
};

const props = defineProps<{
  actions: MenuAction[];
}>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function runAction(action: MenuAction) {
  close();
  action.onClick();
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value) return;
  if (!root.value.contains(event.target as Node)) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

<style scoped>
.table-row-menu {
  position: relative;
  display: inline-flex;
  justify-content: center;
}

.table-row-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #d1dbf9;
  cursor: pointer;
}

.table-row-menu__trigger:hover {
  background: rgba(255, 255, 255, 0.04);
}

.table-row-menu__trigger-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.table-row-menu__panel {
  position: absolute;
  right: 0;
  top: calc(100% + 0.45rem);
  z-index: 35;
  width: 230px;
  padding: 0.5rem;
  border-radius: 18px;
  border: 1px solid rgba(126, 137, 172, 0.16);
  background: #ffffff;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
}

.table-row-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.78rem 0.8rem;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #111827;
  cursor: pointer;
  text-align: left;
}

.table-row-menu__item:hover {
  background: #f3f4f6;
}

.table-row-menu__item--danger {
  color: #ef4444;
}

.table-row-menu__item-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.table-row-menu__item-icon {
  width: 1rem;
  height: 1rem;
}

.table-row-menu__arrow {
  width: 1rem;
  height: 1rem;
  color: currentColor;
}
</style>
