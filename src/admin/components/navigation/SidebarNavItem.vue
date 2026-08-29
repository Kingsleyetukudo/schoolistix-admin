<template>
  <RouterLink
    :to="to"
    class="admin-sidebar-link flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all"
    active-class="admin-sidebar-link--active"
  >
    <span
      v-if="iconComponent"
      class="admin-sidebar-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
    >
      <component
        :is="iconComponent"
        class="h-4 w-4 shrink-0"
        :stroke-width="2"
      />
    </span>
    <span class="truncate">{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { adminNavIcons, type AdminNavIcon } from "./adminNavIcons";

const props = defineProps<{ to: string; icon?: string; label: string }>();

const iconComponent = computed(() => {
  if (!props.icon || !(props.icon in adminNavIcons)) {
    return null;
  }
  return adminNavIcons[props.icon as AdminNavIcon];
});
</script>

<style scoped>
.admin-sidebar-link {
  width: 100%;
  overflow: hidden;
}

.admin-sidebar-link span:last-child {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
