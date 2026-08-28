<template>
  <article class="ops-panel ops-panel--queue">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Priority Queue</span>
        <h2>Items That Need Attention</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--rose">Escalations</span>
    </div>
    <div class="priority-stack">
      <article v-for="item in items" :key="item.title" class="priority-card">
        <div class="priority-card__copy">
          <strong>{{ item.title }}</strong>
          <p>{{ item.detail }}</p>
        </div>
        <span
          class="priority-card__status"
          :class="`priority-card__status--${item.metaClass}`"
        >
          {{ item.meta }}
        </span>
        <small>{{ item.help }}</small>
      </article>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    title: string;
    detail: string;
    meta: string;
    metaClass: string;
    help: string;
  }>;
}>();
</script>

<style scoped>
.ops-panel--queue {
  grid-area: queue;
}
.ops-panel__pill--rose {
  background: rgba(255, 94, 168, 0.14);
  color: #ffc0df;
}

.priority-stack {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}
.priority-card {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    180deg,
    rgba(16, 25, 53, 0.98),
    rgba(11, 15, 46, 0.98)
  );
  padding: 1rem;
}
.priority-card__copy strong {
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 800;
}
.priority-card__copy p {
  margin: 0.5rem 0 0;
  color: #aeb9e1;
  font-size: 0.9rem;
  line-height: 1.6;
}
.priority-card__status {
  display: inline-flex;
  margin-top: 0.8rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 800;
}
.priority-card__status--success {
  background: rgba(55, 195, 255, 0.14);
  color: #b8efff;
}
.priority-card__status--warning {
  background: rgba(253, 181, 42, 0.14);
  color: #ffe2a1;
}
.priority-card__status--danger {
  background: rgba(255, 94, 168, 0.14);
  color: #ffc2df;
}
.priority-card small {
  display: block;
  margin-top: 0.7rem;
  color: #aeb9e1;
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
