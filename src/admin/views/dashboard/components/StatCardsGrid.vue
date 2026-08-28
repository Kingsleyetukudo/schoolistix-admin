<template>
  <div class="stat-cards-grid">
    <StatCard
      v-for="card in cards"
      :key="card.label"
      :label="card.label"
      :value="card.value"
      :icon="card.icon"
      :variant="card.variant"
      :trend-value="card.trendValue"
      :trend-direction="card.trendDirection"
      :trend-period="card.trendPeriod"
      :format="card.format"
    />
  </div>
</template>

<script setup lang="ts">
import StatCard from "./StatCard.vue";

export interface StatCardData {
  label: string;
  value: number | string;
  icon: any;
  variant?: "primary" | "blue" | "cyan" | "purple" | "orange" | "green";
  trendValue?: string;
  trendDirection?: "up" | "down" | "flat";
  trendPeriod?: string;
  format?: "currency" | "number" | "percentage" | "text";
}

defineProps<{
  cards: StatCardData[];
}>();
</script>

<style scoped>
.stat-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

/* Large desktop (1200px and below) */
@media (max-width: 1200px) {
  .stat-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Tablet (768px and below) */
@media (max-width: 768px) {
  .stat-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.875rem;
  }
}

/* Mobile (480px and below) */
@media (max-width: 480px) {
  .stat-cards-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
