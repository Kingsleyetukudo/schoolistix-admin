<template>
  <div class="radial-chart-container">
    <apexchart
      type="radialBar"
      height="250"
      :options="chartOptions"
      :series="[score]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { ApexOptions } from "apexcharts";

const apexchart = defineAsyncComponent(() => import("vue3-apexcharts"));

const props = defineProps<{
  score: number;
  label?: string;
}>();

const chartOptions = computed(
  () =>
    ({
      chart: {
        type: "radialBar" as const,
        background: "transparent",
        animations: { enabled: true, speed: 800 },
        toolbar: { show: false },
      },
      states: {
        hover: {
          filter: { type: "none" },
        },
        active: {
          filter: { type: "none" },
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -140,
          endAngle: 140,
          hollow: { size: "72%", background: "transparent" },
          track: {
            background: "rgba(126, 137, 172, 0.12)",
            strokeWidth: "100%",
            margin: 4,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: "38px",
              fontWeight: 800,
              color: "#FFFFFF",
              offsetY: 8,
              formatter: (val: number) => `${Math.round(val)}%`,
            },
            total: {
              show: false,
            },
          },
        },
      },
      colors: ["#57C3FF"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.35,
          gradientToColors: ["#6C72FF"],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      stroke: { lineCap: "round" as const },
      labels: [props.label || "Metric"],
      tooltip: {
        theme: "dark" as const,
        y: { formatter: (val: number) => `${Math.round(val)}%` },
      },
    }) as ApexOptions,
);
</script>

<style scoped>
.radial-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0 0.15rem;
  position: relative;
}

.radial-chart-container::before {
  content: "";
  position: absolute;
  inset: 12% 18%;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(87, 195, 255, 0.16),
    transparent 70%
  );
  filter: blur(12px);
  pointer-events: none;
}
</style>
