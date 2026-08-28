<template>
  <div class="stat-card">
    <div
      class="stat-card__icon-wrapper"
      :class="`stat-card__icon-wrapper--${variant}`"
    >
      <component :is="icon" class="stat-card__icon" />
    </div>
    <div class="stat-card__content">
      <p class="stat-card__label">{{ label }}</p>
      <h3 class="stat-card__value">{{ formattedValue }}</h3>
      <div class="stat-card__trend" :class="trendClass">
        <svg
          class="stat-card__trend-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="trendDirection === 'up'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
          <path
            v-else-if="trendDirection === 'down'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h14"
          />
        </svg>
        <span class="stat-card__trend-value">{{ trendValue }}</span>
        <span class="stat-card__trend-period">{{ trendPeriod }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number | string;
    icon: any;
    variant?: "primary" | "blue" | "cyan" | "purple" | "orange" | "green";
    trendValue?: string;
    trendDirection?: "up" | "down" | "flat";
    trendPeriod?: string;
    format?: "currency" | "number" | "percentage" | "text";
  }>(),
  {
    variant: "primary",
    trendDirection: "up",
    trendPeriod: "vs last month",
    format: "number",
  },
);

const formattedValue = computed(() => {
  const numValue =
    typeof props.value === "number"
      ? props.value
      : parseFloat(props.value as string);
  if (isNaN(numValue)) return props.value;

  switch (props.format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(numValue);
    case "percentage":
      return `${numValue}%`;
    case "number":
      return numValue.toLocaleString();
    default:
      return props.value;
  }
});

const trendClass = computed(() => {
  if (props.trendDirection === "up") return "stat-card__trend--up";
  if (props.trendDirection === "down") return "stat-card__trend--down";
  return "stat-card__trend--flat";
});
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(
    135deg,
    rgba(16, 25, 53, 0.9),
    rgba(11, 15, 46, 0.95)
  );
  border: 1px solid rgba(126, 137, 172, 0.12);
  border-radius: 1.25rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(108, 114, 255, 0.3);
}

.stat-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: rgba(108, 114, 255, 0.12);
}

.stat-card__icon-wrapper--primary {
  background: rgba(108, 114, 255, 0.12);
}

.stat-card__icon-wrapper--blue {
  background: rgba(87, 195, 255, 0.12);
}

.stat-card__icon-wrapper--cyan {
  background: rgba(87, 195, 255, 0.12);
}

.stat-card__icon-wrapper--purple {
  background: rgba(154, 145, 251, 0.12);
}

.stat-card__icon-wrapper--orange {
  background: rgba(253, 181, 42, 0.12);
}

.stat-card__icon-wrapper--green {
  background: rgba(34, 197, 94, 0.12);
}

.stat-card__icon {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 1.5;
  color: #ffffff;
}

.stat-card__content {
  flex: 1;
  min-width: 0;
}

.stat-card__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #aeb9e1;
  margin-bottom: 0.25rem;
}

.stat-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
  word-break: break-word;
}

.stat-card__trend {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.stat-card__trend--up {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.stat-card__trend--down {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.stat-card__trend--flat {
  background: rgba(126, 137, 172, 0.12);
  color: #aeb9e1;
}

.stat-card__trend-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.stat-card__trend-value {
  font-weight: 600;
}

.stat-card__trend-period {
  color: #7e89ac;
  font-weight: 400;
  margin-left: 0.25rem;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
    gap: 0.875rem;
  }

  .stat-card__icon-wrapper {
    width: 3rem;
    height: 3rem;
  }

  .stat-card__icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .stat-card__value {
    font-size: 1.5rem;
  }

  .stat-card__label {
    font-size: 0.8rem;
  }

  .stat-card__trend {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: row;
    align-items: center;
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .stat-card__icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
  }

  .stat-card__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .stat-card__value {
    font-size: 1.25rem;
  }

  .stat-card__label {
    font-size: 0.75rem;
  }

  .stat-card__trend {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
  }

  .stat-card__trend-period {
    display: none;
  }
}

/* Extra small devices (below 360px) */
@media (max-width: 360px) {
  .stat-card__trend-value {
    display: none;
  }

  .stat-card__trend-icon {
    width: 0.75rem;
    height: 0.75rem;
  }
}
</style>
