<template>
  <span class="status-pill" :class="`status-pill--${badgeVariant}`">
    {{ badgeText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status: string;
  variant?: "success" | "warning" | "danger" | "default" | "info";
  text?: string;
}>();

const STATUS_LABELS: Record<string, string> = {
  // Support ticket statuses
  pending_agent_response: "Pending Agent Response",
  pending_customer_response: "Awaiting Customer Reply",
  in_progress: "In Progress",
  answered: "Answered",
  resolved: "Resolved",
  closed: "Closed",
  open: "Open",
  // Priorities
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
  // Subscriptions / payments / schools
  active: "Active",
  trial: "Trial",
  pending: "Pending",
  paid: "Paid",
  success: "Successful",
  approved: "Approved",
  rejected: "Rejected",
  failed: "Failed",
  past_due: "Past Due",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  suspended: "Suspended",
  expired: "Expired",
  free: "Free",
  // Announcements / maintenance / health
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  sent: "Sent",
  completed: "Completed",
  warning: "Warning",
  healthy: "Healthy",
  degraded: "Degraded",
  offline: "Offline",
  online: "Online",
  disabled: "Disabled",
  invited: "Invited",
  // Admin roles
  super_admin: "Super Admin",
  billing_admin: "Billing Admin",
  support_admin: "Support Admin",
  technical_admin: "Technical Admin",
  auditor: "Auditor",
};

const badgeVariant = computed(() => {
  if (props.variant) return props.variant;

  const normalized = String(props.status).toLowerCase();
  if (
    normalized === "active" ||
    normalized === "paid" ||
    normalized === "success" ||
    normalized === "approved" ||
    normalized === "completed" ||
    normalized === "answered" ||
    normalized === "resolved" ||
    normalized === "healthy" ||
    normalized === "online" ||
    normalized === "published" ||
    normalized === "sent"
  ) {
    return "success";
  }
  if (
    normalized === "pending" ||
    normalized === "trial" ||
    normalized === "warning" ||
    normalized === "past_due" ||
    normalized === "pending_agent_response" ||
    normalized === "pending_customer_response" ||
    normalized === "scheduled" ||
    normalized === "degraded"
  ) {
    return "warning";
  }
  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "suspended" ||
    normalized === "danger" ||
    normalized === "disabled" ||
    normalized === "expired" ||
    normalized === "offline" ||
    normalized === "rejected" ||
    normalized === "urgent" ||
    normalized === "high"
  ) {
    return "danger";
  }
  if (normalized === "in_progress" || normalized === "open") {
    return "info";
  }

  return "default";
});

const humanize = (value: string) => {
  const label = STATUS_LABELS[value];
  if (label) return label;

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const badgeText = computed(() => props.text ?? humanize(String(props.status)));
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 0.7rem;
  border: 1px solid #000000;
  background: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-pill--success {
  color: #166534;
}

.status-pill--warning {
  color: #b45309;
}

.status-pill--danger {
  color: #be123c;
}

.status-pill--info {
  color: #1e40af;
}

.status-pill--default {
  color: #333333;
}
</style>