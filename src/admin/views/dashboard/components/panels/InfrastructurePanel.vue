<template>
  <article class="ops-panel ops-panel--ops">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Operations Readiness</span>
        <h2>Infrastructure Signals</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--amber">Backend health</span>
    </div>
    <div class="signal-grid">
      <article v-for="item in operations" :key="item.label" class="signal-card">
        <span class="signal-card__label">{{ item.label }}</span>
        <strong :class="`signal-card__value--${item.valueClass}`">{{
          item.value
        }}</strong>
        <small>{{ item.detail || "Operational" }}</small>
      </article>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  operations: Array<{
    label: string;
    value: string;
    valueClass: string;
    detail?: string;
  }>;
}>();
</script>

<style scoped>
.ops-panel--ops {
  grid-area: ops;
}
.ops-panel__pill--amber {
  background: rgba(253, 181, 42, 0.14);
  color: #ffe29e;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}
.signal-card {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    180deg,
    rgba(16, 25, 53, 0.98),
    rgba(11, 15, 46, 0.98)
  );
  padding: 0.95rem;
}
.signal-card__label {
  display: block;
  color: #aeb9e1;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.signal-card strong {
  display: block;
  margin-top: 0.45rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
}
.signal-card small {
  display: block;
  margin-top: 0.4rem;
  color: #aeb9e1;
  font-size: 0.9rem;
  line-height: 1.6;
}
.signal-card__value--success {
  color: #57c3ff;
}
.signal-card__value--warning {
  color: #fdb52a;
}
.signal-card__value--danger {
  color: #ff5ea8;
}
.signal-card__value--default {
  color: #d1dbf9;
}
</style>
