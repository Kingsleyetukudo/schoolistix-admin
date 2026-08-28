<template>
  <div class="reach-panel__gauge">
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
  centerValue?: string | number;
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
        labels: { colors: "#333333" },
        itemMargin: { horizontal: 10, vertical: 8 },
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
                fontSize: "16px",
                color: "#111111",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "28px",
                fontWeight: "bold",
                color: "#111111",
                offsetY: 10,
                formatter: (val: string) => `${val}`,
              },
              total: {
                show: true,
                label: props.centerLabel || "Total",
                color: "#666666",
                fontSize: "12px",
                formatter: () =>
                  `${props.centerValue ?? props.data.reduce((sum, item) => sum + item.value, 0)}`,
              },
            },
          },
        },
      },
      tooltip: {
        theme: "light" as const,
        y: { formatter: (val: number) => `${val}` },
        style: { fontSize: "12px", fontFamily: "Cabin, system-ui, sans-serif" },
      },
      responsive: [
        {
          breakpoint: 640,
          options: { chart: { width: "100%" }, legend: { position: "bottom" } },
        },
      ],
    }) as ApexOptions,
);
</script>