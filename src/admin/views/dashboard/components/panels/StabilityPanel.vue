<template>
  <article class="ops-panel ops-panel--support">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Support & Billing</span>
        <h2>Stability Pulse</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--cyan">Queue watch</span>
    </div>
    <div class="pulse-card">
      <RadialBarChart :score="stabilityScore" label="Platform Health" />
      <div class="pulse-card__stats">
        <article
          v-for="item in renewalItems"
          :key="item.label"
          class="pulse-card__stat"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import RadialBarChart from "../charts/RadialBarChart.vue";

defineProps<{
  stabilityScore: number;
  renewalItems: Array<{ label: string; value: string | number }>;
}>();
</script>

<style scoped>
.ops-panel {
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    180deg,
    rgba(16, 25, 53, 0.98),
    rgba(11, 15, 46, 0.98)
  );
  border-radius: 22px;
  padding: 1.15rem;
}

.ops-panel--support {
  grid-area: support;
}

.ops-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.ops-panel__eyebrow {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: #d1dbf9;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.ops-panel__header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 800;
}

.ops-panel__pill--cyan {
  background: rgba(55, 195, 255, 0.14);
  color: #bdeeff;
}

.pulse-card {
  display: grid;
  gap: 1rem;
}

.pulse-card__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.pulse-card__stat {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 18px;
  padding: 0.85rem 0.9rem;
}

.pulse-card__stat span {
  display: block;
  color: #aeb9e1;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pulse-card__stat strong {
  display: block;
  margin-top: 0.45rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
}
</style>
