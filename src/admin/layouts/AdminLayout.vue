<template>
  <div class="h-screen overflow-hidden bg-white text-slate-900">
    <!-- Desktop Sidebar (hidden on mobile, visible lg+) -->
    <div class="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col lg:flex">
      <div
        class="flex h-full flex-col overflow-hidden bg-[#0b1124] border-r border-black lg:bg-[#090a0f]"
      >
        <div
          class="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
        >
          <Sidebar />
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Drawer -->
    <TransitionRoot appear :show="isSidebarOpen" as="template">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="closeSidebar">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="duration-200 ease-in"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <div
                class="flex h-full flex-col overflow-hidden bg-[#0b1124] border-r border-black lg:bg-[#090a0f]"
              >
                <div
                  class="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
                >
                  <Sidebar @close="closeSidebar" />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Main Content Area -->
    <div class="flex h-full flex-col lg:pl-72">
      <!-- Fixed Header with mobile menu button -->
      <div
        class="sticky top-0 z-20 flex-shrink-0 border-b border-black bg-white"
      >
        <Header @menu-click="toggleSidebar" />
      </div>

      <!-- Scrollable Main Content -->
      <main
        class="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 p-3 sm:p-4 lg:p-6 bg-white"
      >
        <div class="w-full">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import Header from "./Header.vue";
import Sidebar from "./Sidebar.vue";
import { useAdminAuth } from "@admin/composables/useAdminAuth";
import { useIdleLogout } from "@admin/composables/useIdleLogout";

const router = useRouter();
const { logout } = useAdminAuth();
const isSidebarOpen = ref(false);

const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

useIdleLogout({
  timeoutMs: IDLE_TIMEOUT_MS,
  onIdle: () => {
    logout();
    router.push({ name: "AdminLogin", query: { reason: "idle" } });
  },
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 9999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.35);
}
</style>