<template>
  <div class="ops-bar-chart">
    <div class="ops-bar-chart__legend">
      <span
        ><span class="ops-bar-chart__dot ops-bar-chart__dot--violet"></span
        >Revenue</span
      >
      <span
        ><span class="ops-bar-chart__dot ops-bar-chart__dot--cyan"></span
        >Expenses</span
      >
    </div>
    <apexchart
      type="bar"
      height="320"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { ApexOptions } from "apexcharts";

const apexchart = defineAsyncComponent(() => import("vue3-apexcharts"));

const props = defineProps<{
  revenueSeries: number[];
  expensesSeries: number[];
  monthLabels: string[];
  currencySymbol?: string;
}>();

const chartOptions = computed(
  () =>
    ({
      chart: {
        type: "bar" as const,
        toolbar: { show: false },
        background: "transparent",
        animations: { enabled: true, easing: "easeinout", speed: 800 },
        fontFamily: "Cabin, system-ui, sans-serif",
      },
      colors: ["#6C72FF", "#57C3FF"],
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: "end" as const,
          columnWidth: "55%",
          distributed: false,
          horizontal: false,
          endingShape: "rounded",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: props.monthLabels,
        labels: {
          style: { colors: "#AEB9E1", fontSize: "12px", fontWeight: 600 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#7E89AC", fontSize: "11px", fontWeight: 600 },
          formatter: (value: number) => {
            return props.currencySymbol === "NGN"
              ? `₦${value.toLocaleString()}`
              : `$${value.toLocaleString()}`;
          },
        },
        title: {
          text: "Amount",
          style: { color: "#AEB9E1", fontSize: "12px", fontWeight: 600 },
        },
      },
      grid: {
        borderColor: "rgba(126, 137, 172, 0.15)",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (value: number) => {
            return props.currencySymbol === "NGN"
              ? `₦${value.toLocaleString()}`
              : `$${value.toLocaleString()}`;
          },
        },
        style: { fontSize: "12px", fontFamily: "Cabin, system-ui, sans-serif" },
      },
      legend: { show: false },
      fill: { opacity: 1, type: "solid" },
    }) as ApexOptions,
);

const chartSeries = computed(() => [
  { name: "Revenue", data: props.revenueSeries },
  { name: "Expenses", data: props.expensesSeries },
]);
</script>
