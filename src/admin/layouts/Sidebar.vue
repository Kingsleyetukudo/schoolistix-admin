<template>
  <aside
    class="admin-sidebar flex h-full w-[19rem] flex-col border-r border-white/6 bg-[#040738] overflow-x-hidden"
  >
    <!-- Logo section - fixed at top, never scrolls -->
    <div class="shrink-0 px-3 pt-5">
      <div class="px-2">
        <img
          :src="sidebarLogo"
          alt="Schoolistix"
          class="admin-sidebar-logo w-full max-w-[11rem] object-contain"
        />
      </div>
    </div>

    <!-- Navigation section - scrollable area (vertical only) -->
    <div
      class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
    >
      <div class="py-4">
        <SidebarNav />
      </div>
    </div>

    <!-- Weekly brief card - fixed at bottom, never scrolls -->
    <div class="shrink-0 px-3 pb-5">
      <div
        class="relative overflow-hidden rounded-[1.5rem] border border-violet-400/15 bg-gradient-to-br from-violet-500/20 via-violet-500/8 to-slate-900 p-3 shadow-[0_18px_55px_-28px_rgba(109,96,255,0.55)]"
      >
        <img
          :src="maintenanceArt"
          alt=""
          class="pointer-events-none absolute -bottom-4 right-0 h-24 w-24 opacity-70"
        />
        <div class="relative">
          <p class="text-sm font-semibold text-white">Weekly control brief</p>
          <p class="mt-1 text-xs leading-5 text-slate-300">
            Review billing risk, unresolved tickets, and school growth before
            your next ops meeting.
          </p>
          <button
            class="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-violet-100"
          >
            Open summary
            <ArrowUpRight class="h-3 w-3" :stroke-width="2.3" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";
import SidebarNav from "@admin/components/navigation/SidebarNav.vue";
import maintenanceArt from "@admin/assets/images/maintenance-bg.svg";
import sidebarLogo from "@admin/assets/images/newLogo.webp";
</script>

<style scoped>
/* Remove horizontal scroll completely */
.admin-sidebar {
  overflow-x: hidden;
  overflow-y: auto;
  max-width: 100%;
}

/* Custom vertical scrollbar for navigation */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Ensure all child elements don't overflow */
.admin-sidebar * {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
