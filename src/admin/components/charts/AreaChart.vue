<template>
  <apexchart
    type="area"
    height="280"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { ApexOptions } from "apexcharts";

const apexchart = defineAsyncComponent(() => import("vue3-apexcharts"));

const props = defineProps<{
  data: number[];
  categories: string[];
  label?: string;
  color?: string;
}>();

const chartOptions = computed(
  () =>
    ({
      chart: {
        type: "area" as const,
        toolbar: { show: false },
        background: "transparent",
        animations: { enabled: true, speed: 800 },
        zoom: { enabled: false },
        fontFamily: "Cabin, system-ui, sans-serif",
      },
      colors: [props.color || "#111111"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.2,
          opacityFrom: 0.25,
          opacityTo: 0.03,
          stops: [0, 90, 100],
        },
      },
      stroke: { curve: "smooth" as const, width: 2 },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "rgba(0, 0, 0, 0.12)",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: props.categories,
        labels: {
          style: { colors: "#555555", fontSize: "11px", fontWeight: 600 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#777777", fontSize: "11px", fontWeight: 600 },
        },
        title: {
          text: props.label || "Count",
          style: { color: "#555555", fontSize: "12px", fontWeight: 600 },
        },
      },
      tooltip: {
        theme: "light" as const,
        y: { formatter: (val: number) => `${val.toLocaleString()}` },
        style: { fontSize: "12px", fontFamily: "Cabin, system-ui, sans-serif" },
      },
      legend: { show: false },
    }) as ApexOptions,
);

const series = computed(() => [
  { name: props.label || "Count", data: props.data },
]);
</script>