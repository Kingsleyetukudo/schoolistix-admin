import { computed, ref } from 'vue'

export function useDataTable<T extends Record<string, unknown>>(rows: T[]) {
  const page = ref(1)
  const pageSize = ref(10)
  const search = ref('')

  const filteredRows = computed(() =>
    rows.filter((row) =>
      search.value
        ? Object.values(row).some((value) => String(value).toLowerCase().includes(search.value.toLowerCase()))
        : true,
    ),
  )

  const paginatedRows = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredRows.value.slice(start, start + pageSize.value)
  })

  return { page, pageSize, search, filteredRows, paginatedRows }
}
