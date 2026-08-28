<template>
  <div class="donut-chart-container">
    <apexchart
      type="donut"
      width="100%"
      height="280"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { ApexOptions } from "apexcharts";

const apexchart = defineAsyncComponent(() => import("vue3-apexcharts"));

const props = defineProps<{
  data: Array<{ label: string; value: number; color: string }>;
  centerLabel?: string;
}>();

const series = computed(() => props.data.map((item) => item.value));

const chartOptions = computed(
  () =>
    ({
      chart: {
        type: "donut" as const,
        background: "transparent",
        animations: { enabled: true, speed: 800 },
        toolbar: { show: false },
      },
      colors: props.data.map((item) => item.color),
      labels: props.data.map((item) => item.label),
      legend: {
        show: false,
        position: "bottom" as const,
        labels: { colors: "#D1DBF9" },
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "14px",
                color: "#AEB9E1",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "24px",
                fontWeight: "bold",
                color: "#FFFFFF",
                offsetY: 10,
              },
              total: {
                show: true,
                label: "Total",
                color: "#7E89AC",
                fontSize: "12px",
                formatter: () =>
                  `${props.data.reduce((sum, item) => sum + item.value, 0)}`,
              },
            },
          },
        },
      },
      tooltip: {
        theme: "dark" as const,
        y: { formatter: (val: number) => `${val} schools` },
      },
      responsive: [
        {
          breakpoint: 640,
          options: { chart: { height: 220 } },
        },
      ],
    }) as ApexOptions,
);
</script>

<style scoped>
.donut-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
