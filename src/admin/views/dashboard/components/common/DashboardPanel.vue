<template>
  <HolderCard class="dashboard-panel">
    <div class="dashboard-panel__header">
      <div class="dashboard-panel__copy">
        <span v-if="eyebrow" class="dashboard-panel__eyebrow">
          {{ eyebrow }}
        </span>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="$slots.meta" class="dashboard-panel__meta">
        <slot name="meta" />
      </div>
    </div>

    <div class="dashboard-panel__body">
      <slot />
    </div>
  </HolderCard>
</template>

<script setup lang="ts">
import HolderCard from "@/admin/components/common/HolderCard.vue";

defineProps<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<style scoped>
.dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
}

.dashboard-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.dashboard-panel__copy {
  min-width: 0;
}

.dashboard-panel__eyebrow {
  display: inline-block;
  margin-bottom: 0.35rem;
  color: #9faae2;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.dashboard-panel__copy h2 {
  margin: 0;
  color: #f8f9ff;
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.2;
}

.dashboard-panel__copy p {
  margin: 0.3rem 0 0;
  color: #c7d2f1;
  font-size: 0.82rem;
  line-height: 1.55;
}

.dashboard-panel__meta {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.dashboard-panel__body {
  padding-top: 0.75rem;
  min-width: 0;
}

@media (max-width: 768px) {
  .dashboard-panel__header {
    flex-direction: column;
  }

  .dashboard-panel__meta {
    width: 100%;
    justify-content: flex-start;
  }

  .dashboard-panel {
    gap: 0.65rem;
  }
}
</style>
