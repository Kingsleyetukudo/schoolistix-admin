<template>
  <header class="flex flex-wrap items-start justify-between gap-4 border-b border-black pb-4">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
        Super Admin Control Board
      </p>
      <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
        Platform intelligence, billing posture, and tenant activity in one view.
      </h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Monitor the school network, approve manual payments, control feature
        flags, and manage operator access.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="rounded-full border border-black bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
        {{ platformStatusLabel }}
      </span>
      <span class="rounded-full border border-black bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
        Updated {{ generatedAtLabel }}
      </span>
      <button
        type="button"
        class="rounded-full border border-black bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
        :disabled="isRefreshing"
        @click="$emit('refresh')"
      >
        {{ isRefreshing ? "Refreshing..." : "Refresh Dashboard" }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  platformStatusLabel: string;
  generatedAtLabel: string;
  isRefreshing: boolean;
}>();

defineEmits<{
  (e: "refresh"): void;
}>();
</script>