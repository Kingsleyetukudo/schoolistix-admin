<template>
  <apexchart
    type="line"
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
  data: Array<{ name: string; data: number[] }>;
  categories: string[];
  colors?: string[];
  height?: number;
}>();

const chartOptions = computed(
  () =>
    ({
      chart: {
        type: "line" as const,
        toolbar: { show: false },
        background: "transparent",
        animations: { enabled: true, speed: 800 },
        zoom: { enabled: false },
        fontFamily: "Cabin, system-ui, sans-serif",
      },
      colors: props.colors || ["#6C72FF", "#57C3FF", "#FDB52A"],
      stroke: {
        curve: "smooth" as const,
        width: 2,
        lineCap: "round" as const,
      },
      markers: {
        size: 4,
        colors: ["#FFFFFF"],
        strokeColors: props.colors || ["#6C72FF"],
        strokeWidth: 2,
        hover: { size: 6 },
      },
      grid: {
        borderColor: "rgba(126, 137, 172, 0.15)",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: props.categories,
        labels: {
          style: { colors: "#AEB9E1", fontSize: "11px", fontWeight: 600 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#7E89AC", fontSize: "11px", fontWeight: 600 },
        },
        title: {
          text: "Value",
          style: { color: "#AEB9E1", fontSize: "12px", fontWeight: 600 },
        },
      },
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        style: { fontSize: "12px", fontFamily: "Cabin, system-ui, sans-serif" },
      },
      legend: {
        show: true,
        position: "top" as const,
        horizontalAlign: "right",
        labels: { colors: "#D1DBF9", useSeriesColors: false },
        itemMargin: { horizontal: 12, vertical: 4 },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.1,
          opacityFrom: 0.3,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
    }) as ApexOptions,
);

const series = computed(() => props.data);
</script>
