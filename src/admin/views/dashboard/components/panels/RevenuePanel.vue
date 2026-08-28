<template>
  <article class="ops-panel ops-panel--revenue">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Revenue & Usage</span>
        <h2>Platform Momentum</h2>
      </div>
      <div class="ops-panel__headline">
        <strong>{{ currencyFormatter.format(monthlyRecurringRevenue) }}</strong>
        <span>{{ revenuePercentChange }} vs prior period</span>
      </div>
    </div>
    <div class="ops-panel__stats">
      <div class="ops-panel__stat">
        <span>Churn</span>
        <strong>{{ churnRate }}</strong>
      </div>
      <div class="ops-panel__stat">
        <span>Avg revenue / school</span>
        <strong>{{ currencyFormatter.format(averageRevenuePerSchool) }}</strong>
      </div>
    </div>
    <RevenueChart
      :revenue-series="revenueSeries"
      :expenses-series="expensesSeries"
      :month-labels="monthLabels"
    />
  </article>
</template>

<script setup lang="ts">
import RevenueChart from "../charts/RevenueChart.vue";

defineProps<{
  monthlyRecurringRevenue: number;
  revenuePercentChange: string;
  revenueSeries: number[];
  expensesSeries: number[];
  monthLabels: string[];
  churnRate: string;
  averageRevenuePerSchool: number;
}>();

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
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

.ops-panel--revenue {
  grid-area: revenue;
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

.ops-panel__headline {
  text-align: right;
}

.ops-panel__headline strong {
  display: block;
  color: #ffffff;
  font-size: 1.3rem;
  font-weight: 800;
}

.ops-panel__headline span {
  color: #aeb9e1;
  font-size: 0.76rem;
  font-weight: 700;
}

.ops-panel__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ops-panel__stat {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.85rem 0.95rem;
}

.ops-panel__stat span {
  display: block;
  color: #aeb9e1;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ops-panel__stat strong {
  display: block;
  margin-top: 0.35rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
}

@media (max-width: 768px) {
  .ops-panel__stats {
    grid-template-columns: 1fr;
  }
}
</style>
