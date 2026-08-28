<template>
  <header class="sticky top-0 z-20 bg-white">
    <div
      class="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <div class="flex min-w-0 items-center gap-3">
        <button
          @click="$emit('menuClick')"
          class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div class="min-w-0">
          <h1 class="truncate text-xl font-bold text-slate-900">
            Admin Console
          </h1>
          <p class="truncate text-sm text-slate-500">
            Super admin control board — schools, payments, and features.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div ref="menuRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-3 rounded-2xl border border-black bg-white px-3 py-2 text-left transition hover:bg-slate-50"
            @click="toggleUserMenu"
            aria-label="Open user menu"
          >
            <div
              v-if="user?.avatarUrl"
              class="h-10 w-10 overflow-hidden rounded-full border border-black bg-slate-100"
            >
              <img
                :src="String(user.avatarUrl)"
                :alt="String(user?.name ?? 'Admin')"
                class="h-full w-full object-cover"
              />
            </div>
            <div
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-slate-900 text-sm font-bold text-white"
            >
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-900">
                {{ user?.name ?? "Jane Doe" }}
              </p>
              <p class="truncate text-xs text-slate-500">
                {{ roleLabel || "Super Admin" }}
              </p>
            </div>
            <ChevronDown
              class="h-5 w-5 shrink-0 text-slate-500 transition"
              :class="{ 'rotate-180': isUserMenuOpen }"
            />
          </button>

          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-black bg-white p-2 shadow-xl"
            role="menu"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
              @click="goToProfile"
            >
              <CircleUserRound class="h-4 w-4 text-slate-500" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
              @click="goToSettings"
            >
              <Settings class="h-4 w-4 text-slate-500" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
              @click="logoutAndRedirect"
            >
              <LogOut class="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  Settings,
} from "lucide-vue-next";
import { useAdminAuth } from "@admin/composables/useAdminAuth";

defineEmits(["menuClick"]);

const router = useRouter();
const { user, roleLabel, logout } = useAdminAuth();
const isUserMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const initials = computed(() =>
  String(user.value?.name ?? "Jane Doe")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join(""),
);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const goToProfile = () => {
  closeUserMenu();
  router.push({ name: "AdminSettings", query: { view: "profile" } });
};

const goToSettings = () => {
  closeUserMenu();
  router.push({ name: "AdminSettings" });
};

const logoutAndRedirect = () => {
  closeUserMenu();
  logout();
  router.push({ name: "AdminLogin" });
};

const handlePointerDown = (event: PointerEvent) => {
  if (!isUserMenuOpen.value || !menuRef.value) return;
  const target = event.target;
  if (target instanceof Node && !menuRef.value.contains(target)) {
    closeUserMenu();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeUserMenu();
  }
};

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
});
</script>