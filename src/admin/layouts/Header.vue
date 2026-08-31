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
            Super admin control board - schools, payments, and features.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          v-if="canViewTickets"
          type="button"
          class="relative flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white text-slate-700 transition hover:bg-slate-50"
          title="Support messages"
          aria-label="Support messages"
          @click="goToSupport"
        >
          <MessageCircle class="h-5 w-5" :stroke-width="2.2" />
          <span
            v-if="unreadMessageCount"
            class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white"
          >
            {{ badgeLabel(unreadMessageCount) }}
          </span>
        </button>

        <div v-if="canViewTickets" ref="notificationRef" class="relative">
          <button
            type="button"
            class="relative flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white text-slate-700 transition hover:bg-slate-50"
            title="Notifications"
            aria-label="Notifications"
            @click="toggleNotifications"
          >
            <Bell class="h-5 w-5" :stroke-width="2.2" />
            <span
              v-if="unreadNotificationsCount"
              class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white"
            >
              {{ badgeLabel(unreadNotificationsCount) }}
            </span>
          </button>

          <div
            v-if="isNotificationsOpen"
            class="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-black bg-white shadow-xl"
            role="menu"
          >
            <header
              class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"
            >
              <strong class="text-sm text-slate-900">Notifications</strong>
              <button
                type="button"
                class="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                @click="goToSupport"
              >
                View all
              </button>
            </header>

            <div class="max-h-96 overflow-y-auto p-2">
              <template v-if="notificationItems.length">
                <button
                  v-for="ticket in notificationItems"
                  :key="ticket.id"
                  type="button"
                  class="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                  @click="openTicketFromNotifications(ticket)"
                >
                  <span
                    class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  >
                    <MessageSquare class="h-4 w-4" :stroke-width="2" />
                  </span>
                  <span class="grid min-w-0 gap-0.5">
                    <span class="flex items-center gap-1.5">
                      <span
                        class="truncate text-sm font-semibold text-slate-900"
                      >
                        {{ ticket.schoolName || "School" }}
                      </span>
                      <span
                        class="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500"
                      >
                        {{
                          ticket.channel === "chat" ? "Live chat" : "Ticket"
                        }}
                      </span>
                    </span>
                    <span class="truncate text-xs text-slate-500">
                      {{ ticketSubjectLabel(ticket) }}
                    </span>
                    <span class="text-[11px] font-semibold text-slate-400">
                      {{ relativeTime(ticket.updatedAt) }}
                    </span>
                  </span>
                  <span
                    class="mt-1.5 shrink-0 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-rose-600"
                  >
                    New
                  </span>
                </button>
              </template>
              <p v-else class="px-3 py-8 text-center text-sm text-slate-500">
                No new notifications.
              </p>
            </div>
          </div>
        </div>

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
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
              @click="openChangePassword"
            >
              <KeyRound class="h-4 w-4 text-slate-500" />
              <span>Change password</span>
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

  <ChangePasswordModal
    v-if="isChangePasswordOpen"
    @close="isChangePasswordOpen = false"
  />
</template><script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  LogOut,
  MessageCircle,
  MessageSquare,
  KeyRound,
  Settings,
} from "lucide-vue-next";
import ChangePasswordModal from "@admin/components/forms/ChangePasswordModal.vue";
import { useAdminAuth } from "@admin/composables/useAdminAuth";
import { useSupportStore } from "@admin/stores/support.store";

defineEmits(["menuClick"]);

const route = useRoute();
const router = useRouter();
const { user, roleLabel, logout, hasRole, hydrate } = useAdminAuth();
const supportStore = useSupportStore();
const isUserMenuOpen = ref(false);
const isChangePasswordOpen = ref(false);
const isNotificationsOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const notificationRef = ref<HTMLElement | null>(null);

const canViewTickets = computed(() =>
  hasRole(["super_admin", "support_admin"]),
);

const unreadMessageCount = computed(() =>
  canViewTickets.value
    ? supportStore.tickets.filter((ticket) => ticket.unreadForAdmin).length
    : 0,
);

const unreadNotificationsCount = computed(() =>
  canViewTickets.value
    ? supportStore.tickets.filter((ticket) => ticket.unreadForAdmin).length
    : 0,
);

const notificationItems = computed(() =>
  supportStore.tickets
    .filter((ticket) => ticket.unreadForAdmin)
    .slice()
    .sort(
      (left, right) =>
        new Date(String(right.updatedAt ?? right.createdAt ?? 0)).getTime() -
        new Date(String(left.updatedAt ?? left.createdAt ?? 0)).getTime(),
    )
    .slice(0, 6),
);

const initials = computed(() =>
  String(user.value?.name ?? "Jane Doe")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join(""),
);

const badgeLabel = (count: number) => (count > 99 ? "99+" : String(count));

const ticketSubjectLabel = (ticket: { subject?: string; message?: string }) =>
  String(ticket.subject || ticket.message || "No subject").trim();

const relativeTime = (value: unknown) => {
  if (!value) return "Just now";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const closeNotifications = () => {
  isNotificationsOpen.value = false;
};

const goToProfile = () => {
  closeUserMenu();
  router.push({ name: "AdminSettings", query: { view: "profile" } });
};

const goToSettings = () => {
  closeUserMenu();
  router.push({ name: "AdminSettings" });
};

const openChangePassword = () => {
  closeUserMenu();
  isChangePasswordOpen.value = true;
};

const logoutAndRedirect = () => {
  closeUserMenu();
  logout();
  router.push({ name: "AdminLogin" });
};

const goToSupport = () => {
  closeUserMenu();
  closeNotifications();
  router.push({ name: "AdminSupport" });
};

const openTicketFromNotifications = (ticket: { id?: string }) => {
  closeNotifications();
  if (!ticket?.id) return;
  router.push(`/admin/support/${String(ticket.id)}`);
};

const loadHeaderCounts = async () => {
  if (!canViewTickets.value) return;

  try {
    await supportStore.fetchTickets();
  } catch {
    // Backend may be offline (preview mode); badges simply stay empty.
  }

  if (supportStore.connectionState === "offline") {
    supportStore.connectStream();
  }
};

const handlePointerDown = (event: PointerEvent) => {
  const target = event.target;
  if (!(target instanceof Node)) return;

  if (
    isNotificationsOpen.value &&
    !notificationRef.value?.contains(target)
  ) {
    closeNotifications();
  }
  if (isUserMenuOpen.value && !menuRef.value?.contains(target)) {
    closeUserMenu();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  closeUserMenu();
  closeNotifications();
};

onMounted(() => {
  hydrate();
  void loadHeaderCounts();
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
});

watch(
  () => route.fullPath,
  () => {
    closeUserMenu();
    closeNotifications();
    if (canViewTickets.value && supportStore.connectionState === "offline") {
      supportStore.connectStream();
    }
  },
);

onBeforeUnmount(() => {
  supportStore.disconnectStream();
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
});
</script>