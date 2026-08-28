<template>
  <div class="pulse-card__ring">
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
        animations: {
          enabled: true,
          speed: 800,
          dynamicAnimation: { enabled: true, speed: 350 },
        },
        toolbar: { show: false },
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: "65%", background: "transparent" },
          track: {
            background: "rgba(87, 195, 255, 0.1)",
            strokeWidth: "97%",
            margin: 0,
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: "#AEB9E1",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "32px",
              fontWeight: "bold",
              color: "#FFFFFF",
              offsetY: 10,
              formatter: (val: number) => `${val}%`,
            },
            total: {
              show: true,
              label: props.label || "Health Score",
              color: "#7E89AC",
              fontSize: "11px",
              formatter: () => props.label || "Stability",
            },
          },
        },
      },
      colors: ["#57C3FF"],
      stroke: { lineCap: "round" as const },
      labels: [props.label || "Platform Stability"],
      tooltip: {
        theme: "dark" as const,
        y: { formatter: (val: number) => `${val}%` },
        style: { fontSize: "12px", fontFamily: "Cabin, system-ui, sans-serif" },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 200 },
            plotOptions: {
              radialBar: { dataLabels: { value: { fontSize: "24px" } } },
            },
          },
        },
      ],
    }) as ApexOptions,
);
</script>
