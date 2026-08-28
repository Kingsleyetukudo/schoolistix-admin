<template>
  <div class="stacked-bar-chart">
    <div v-if="showLegend" class="stacked-bar-chart__legend">
      <span v-for="item in chartSeries" :key="item.name">
        <span
          class="stacked-bar-chart__dot"
          :style="{ background: palette[indexFor(item.name)] || palette[0] }"
        ></span>
        {{ item.name }}
      </span>
    </div>

    <apexchart
      type="bar"
      :height="height"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { ApexOptions } from "apexcharts";

const apexchart = defineAsyncComponent(() => import("vue3-apexcharts"));

const props = withDefaults(
  defineProps<{
    series: Array<{ name: string; data: number[] }>;
    categories: string[];
    colors?: string[];
    height?: number;
    showLegend?: boolean;
    valuePrefix?: string;
    valueSuffix?: string;
    yLabel?: string;
  }>(),
  {
    height: 320,
    showLegend: true,
    valuePrefix: "",
    valueSuffix: "",
    yLabel: "Value",
  },
);

const palette = computed(
  () => props.colors ?? ["#d946ef", "#2563eb", "#22d3ee", "#a855f7"],
);

const chartSeries = computed(() => props.series);

const chartOptions = computed(
  () =>
    ({
      chart: {
        type: "bar" as const,
        stacked: true,
        toolbar: { show: false },
        background: "transparent",
        animations: { enabled: true, speed: 800 },
        fontFamily: "Inter, system-ui, sans-serif",
      },
      colors: palette.value,
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: "end" as const,
          columnWidth: "42%",
          horizontal: false,
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories: props.categories,
        labels: {
          style: { colors: "#AEB9E1", fontSize: "12px", fontWeight: 600 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#7E89AC", fontSize: "11px", fontWeight: 600 },
          formatter: (value: number) =>
            `${props.valuePrefix}${value.toLocaleString()}${props.valueSuffix}`,
        },
        title: {
          text: props.yLabel,
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
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) =>
            `${props.valuePrefix}${value.toLocaleString()}${props.valueSuffix}`,
        },
      },
      legend: { show: false },
      fill: { opacity: 1 },
    }) as ApexOptions,
);

function indexFor(name: string) {
  return chartSeries.value.findIndex((item) => item.name === name);
}
</script>

<style scoped>
.stacked-bar-chart {
  width: 100%;
}

.stacked-bar-chart__legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 0.85rem;
  color: #d1dbf9;
  font-size: 0.75rem;
  font-weight: 600;
}

.stacked-bar-chart__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.stacked-bar-chart__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
</style>
