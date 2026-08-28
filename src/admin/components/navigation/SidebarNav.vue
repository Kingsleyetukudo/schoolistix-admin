<template>
  <nav class="w-full space-y-6 overflow-hidden">
    <SidebarNavGroup title="Overview">
      <SidebarNavItem
        v-for="route in overviewRoutes"
        :key="String(route.name)"
        :to="`/admin/${route.path}`"
        :icon="String(route.meta?.icon ?? '')"
        :label="String(route.meta?.title ?? '')"
      />
    </SidebarNavGroup>
    <SidebarNavGroup title="Operations">
      <SidebarNavItem
        v-for="route in operationsRoutes"
        :key="String(route.name)"
        :to="`/admin/${route.path}`"
        :icon="String(route.meta?.icon ?? '')"
        :label="String(route.meta?.title ?? '')"
      />
    </SidebarNavGroup>
    <SidebarNavGroup title="System">
      <SidebarNavItem
        v-for="route in systemRoutes"
        :key="String(route.name)"
        :to="`/admin/${route.path}`"
        :icon="String(route.meta?.icon ?? '')"
        :label="String(route.meta?.title ?? '')"
      />
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        >
          <CircleHelp class="h-4 w-4" :stroke-width="2" />
        </span>
        <span class="truncate">Help Center</span>
      </button>
    </SidebarNavGroup>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CircleHelp } from "lucide-vue-next";
import SidebarNavGroup from "./SidebarNavGroup.vue";
import SidebarNavItem from "./SidebarNavItem.vue";
import { adminSidebarRoutes } from "@admin/router/routes";
import type { RouteRecordRaw } from "vue-router";

const routes = adminSidebarRoutes.filter((route: RouteRecordRaw) =>
  Boolean(route.path),
);

const pickRoutes = (names: string[]) =>
  names
    .map((name) => routes.find((route) => String(route.name) === name))
    .filter((route): route is RouteRecordRaw => Boolean(route));

const overviewRoutes = computed(() =>
  pickRoutes(["AdminDashboard", "AdminReports", "AdminUsers"]),
);
const operationsRoutes = computed(() =>
  pickRoutes([
    "AdminSchools",
    "AdminSubscriptions",
    "AdminPayments",
    "AdminSupport",
    "AdminAnnouncements",
    "AdminAudit",
  ]),
);
const systemRoutes = computed(() =>
  pickRoutes([
    "AdminHealth",
    "AdminFeatures",
    "AdminMaintenance",
    "AdminSettings",
  ]),
);
</script>
