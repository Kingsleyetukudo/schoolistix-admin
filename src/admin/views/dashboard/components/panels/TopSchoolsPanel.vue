<template>
  <article class="ops-panel ops-panel--schools">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Top Tenants</span>
        <h2>Largest School Footprint</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--blue"
        >{{ totalStudentsText }} learners</span
      >
    </div>
    <div class="tenant-list">
      <article
        v-for="school in schools"
        :key="school.name"
        class="tenant-list__item"
      >
        <div class="tenant-list__copy">
          <strong>{{ school.name }}</strong>
          <span>{{ school.staffText }}</span>
        </div>
        <div class="tenant-list__bar">
          <span :style="{ width: school.progress }"></span>
        </div>
        <small>{{ school.studentText }} students</small>
      </article>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  schools: Array<{
    name: string;
    progress: string;
    studentText: string;
    staffText: string;
  }>;
  totalStudentsText: string;
}>();
</script>

<style scoped>
.ops-panel--schools {
  grid-area: schools;
}
.ops-panel__pill--blue {
  background: rgba(74, 109, 255, 0.14);
  color: #ced9ff;
}

.tenant-list {
  display: grid;
  gap: 0.8rem;
}
.tenant-list__item {
  display: grid;
  gap: 0.55rem;
  padding: 0.8rem 0;
  border-radius: 18px;
}
.tenant-list__copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.tenant-list__copy strong {
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 800;
}
.tenant-list__copy span {
  color: #aeb9e1;
  font-size: 0.9rem;
  line-height: 1.6;
}
.tenant-list__bar {
  overflow: hidden;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
}
.tenant-list__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6c72ff 0%, #57c3ff 100%);
}
.tenant-list__item small {
  color: #d1dbf9;
  font-size: 0.74rem;
  font-weight: 700;
}
</style>
