<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Change password"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Change password</h3>
          <p class="mt-1 text-sm text-slate-500">
            Update the password for your admin account.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
          @click="$emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <form class="grid gap-4" @submit.prevent="submit">
        <label class="grid gap-1.5 text-sm font-semibold text-slate-700">
          Current password
          <input
            v-model="form.currentPassword"
            type="password"
            required
            autocomplete="current-password"
            class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
        </label>

        <label class="grid gap-1.5 text-sm font-semibold text-slate-700">
          New password
          <input
            v-model="form.newPassword"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
          <small class="font-normal text-slate-400">
            Use at least 8 characters.
          </small>
        </label>

        <label class="grid gap-1.5 text-sm font-semibold text-slate-700">
          Confirm new password
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
        </label>

        <p
          v-if="error"
          class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600"
        >
          {{ error }}
        </p>
        <p
          v-if="success"
          class="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600"
        >
          {{ success }}
        </p>

        <div class="mt-1 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ saving ? "Saving..." : "Update password" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { X } from "lucide-vue-next";
import { adminApi } from "@admin/services/adminApi";

defineEmits(["close"]);

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const saving = ref(false);
const error = ref("");
const success = ref("");

const submit = async () => {
  error.value = "";
  success.value = "";

  if (form.newPassword !== form.confirmPassword) {
    error.value = "New password and confirmation do not match.";
    return;
  }

  saving.value = true;
  try {
    await adminApi.post("/change-password", {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    success.value = "Password updated successfully.";
    form.currentPassword = "";
    form.newPassword = "";
    form.confirmPassword = "";
  } catch (requestError: unknown) {
    const axiosError = requestError as {
      response?: { data?: { error?: string } };
    };
    error.value =
      axiosError.response?.data?.error || "Unable to update your password.";
  } finally {
    saving.value = false;
  }
};
</script>