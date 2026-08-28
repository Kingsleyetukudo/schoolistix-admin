<!-- src/admin/views/dashboard/components/panels/SchoolsTablePanel.vue -->
<template>
  <article class="ops-panel ops-panel--table">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">Tenant Watchlist</span>
        <h2>School Operations Snapshot</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--violet"
        >Responsive table</span
      >
    </div>
    <div class="tenant-table-wrap">
      <table class="tenant-table">
        <thead>
          <tr>
            <th>School</th>
            <th>Learners</th>
            <th>Staff</th>
            <th>Plan</th>
            <th>Tenant status</th>
            <th>Subscription</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <div class="tenant-table__school">
                <strong>{{ row.name }}</strong>
                <span>{{ row.subdomain }}</span>
              </div>
            </td>
            <td>{{ row.students }}</td>
            <td>{{ row.staff }}</td>
            <td>{{ row.plan }}</td>
            <td>
              <StatusBadge
                :variant="row.tenantStatusClass"
                :text="row.tenantStatus"
              />
            </td>
            <td>
              <StatusBadge
                :variant="row.subscriptionStatusClass"
                :text="row.subscriptionStatus"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<script setup lang="ts">
import StatusBadge from "../common/StatusBadge.vue";

defineProps<{
  rows: Array<{
    id: string;
    name: string;
    subdomain: string;
    students: string;
    staff: string;
    plan: string;
    tenantStatus: string;
    tenantStatusClass: "success" | "warning" | "danger";
    subscriptionStatus: string;
    subscriptionStatusClass: "success" | "warning" | "danger";
  }>;
}>();
</script>

<style scoped>
.ops-panel--table {
  grid-area: table;
}

.tenant-table-wrap {
  overflow-x: auto;
}
.tenant-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
.tenant-table th,
.tenant-table td {
  padding: 0.95rem 0.85rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.tenant-table th {
  color: #d1dbf9;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.tenant-table td {
  color: #d1dbf9;
  font-size: 0.86rem;
  font-weight: 700;
}
.tenant-table tbody tr:last-child td {
  border-bottom: 0;
}

.tenant-table__school {
  display: grid;
  gap: 0.25rem;
}
.tenant-table__school strong {
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 800;
}
.tenant-table__school span {
  color: #aeb9e1;
  font-size: 0.74rem;
  font-weight: 600;
}
</style>
