<template>
  <article class="ops-panel ops-panel--activity">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Recent Activity</span>
        <h2>Latest Platform Events</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--green">Live feed</span>
    </div>

    <div class="activity-feed">
      <article v-for="item in items" :key="item.title" class="activity-item">
        <span class="activity-item__tone" :class="`activity-item__tone--${item.tone}`"></span>
        <div class="activity-item__copy">
          <div class="activity-item__headline">
            <strong>{{ item.title }}</strong>
            <span>{{ item.meta }}</span>
          </div>
          <p>{{ item.detail }}</p>
        </div>
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
    tone: "success" | "warning" | "danger" | "default";
  }>;
}>();
</script>

<style scoped>
.ops-panel--activity {
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    180deg,
    rgba(16, 25, 53, 0.98),
    rgba(11, 15, 46, 0.98)
  );
  border-radius: 22px;
  padding: 1rem;
  height: 100%;
}

.ops-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.ops-panel__eyebrow {
  display: inline-block;
  margin-bottom: 0.35rem;
  color: #d1dbf9;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.ops-panel__header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
}

.ops-panel__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
}

.ops-panel__pill--green {
  background: rgba(55, 195, 255, 0.14);
  color: #b8efff;
}

.activity-feed {
  display: grid;
  gap: 0.8rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.85rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
}

.activity-item__tone {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 0.35rem;
  flex-shrink: 0;
}

.activity-item__tone--success {
  background: #57c3ff;
}

.activity-item__tone--warning {
  background: #fdb52a;
}

.activity-item__tone--danger {
  background: #ff5ea8;
}

.activity-item__tone--default {
  background: #7e89ac;
}

.activity-item__copy {
  min-width: 0;
  flex: 1;
}

.activity-item__headline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.activity-item__headline strong {
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 800;
}

.activity-item__headline span {
  color: #aeb9e1;
  font-size: 0.72rem;
  white-space: nowrap;
}

.activity-item p {
  margin: 0.3rem 0 0;
  color: #aeb9e1;
  font-size: 0.8rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .activity-item__headline {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-item__headline span {
    white-space: normal;
  }
}
</style>
