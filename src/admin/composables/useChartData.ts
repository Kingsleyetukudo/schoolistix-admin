import { computed } from 'vue'

export function useChartData(values: number[], label: string) {
  return computed(() => ({
    labels: values.map((_, index) => `P${index + 1}`),
    datasets: [
      {
        label,
        data: values,
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.15)',
      },
    ],
  }))
}
