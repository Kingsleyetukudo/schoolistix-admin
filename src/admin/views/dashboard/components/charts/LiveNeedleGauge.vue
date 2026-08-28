<template>
  <div class="live-needle-gauge">
    <apexchart
      type="gauge"
      :height="height"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { ApexOptions } from "apexcharts";

const apexchart = defineAsyncComponent(() => import("vue3-apexcharts"));

const props = withDefaults(
  defineProps<{
    score: number;
    height?: number;
  }>(),
  {
    height: 360,
  },
);

const clampedScore = computed(() => Math.min(100, Math.max(0, props.score)));
const series = computed(() => [clampedScore.value]);

const chartOptions = computed(
  () =>
    ({
      chart: {
        height: props.height,
        type: "gauge" as const,
        background: "transparent",
        toolbar: { show: false },
        animations: {
          enabled: true,
          dynamicAnimation: {
            enabled: true,
            speed: 800,
          },
        },
      },
      colors: ["#00A86F"],
      plotOptions: {
        radialBar: {
          shape: "needle" as const,
          startAngle: -90,
          endAngle: 90,
          min: 0,
          max: 100,
          ticks: {
            show: true,
            major: {
              count: 4,
              length: 0,
              width: 0,
              color: "transparent",
              placement: "outside" as const,
            },
            minor: {
              count: 0,
              length: 0,
              width: 0,
              color: "transparent",
            },
            labels: {
              show: true,
              offset: 25,
              fontSize: "12px",
              fontWeight: 500,
              color: "#FFFFFF",
              formatter: (value: number) =>
                value === 0 || value === 100 ? `${value}` : value.toFixed(2),
            },
          },
          needle: {
            color: "#1E293B",
            length: "85%",
            baseWidth: 10,
            tipWidth: 1,
            showValueArc: true,
          },
          track: {
            show: true,
            background: "#ddd",
            strokeWidth: "100%",
            margin: 0,
          },
          hollow: {
            margin: 0,
            size: "70%",
            background: "transparent",
          },
          dataLabels: {
            name: {
              show: true,
              offsetY: -10,
              fontSize: "14px",
              fontWeight: 700,
              color: "#FFFFFF",
            },
            value: {
              show: true,
              offsetY: 20,
              fontSize: "34px",
              fontWeight: 700,
              color: "#FFFFFF",
              formatter: (value: number) => `${Math.round(value)}%`,
            },
          },
        },
      },
      stroke: {
        lineCap: "butt" as const,
      },
      labels: ["series-1"],
      tooltip: {
        enabled: false,
      },
    }) as ApexOptions,
);
</script>

<style scoped>
.live-needle-gauge {
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
</style>
