<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{{ eyebrow }}</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ title }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{{ description }}</p>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow?: string
  }>(),
  {
    eyebrow: 'Admin Workspace',
  },
)
</script>