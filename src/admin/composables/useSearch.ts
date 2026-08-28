import { ref, watch } from 'vue'

export function useSearch(callback: (value: string) => void, delay = 250) {
  const query = ref('')
  let timer = 0

  watch(query, (value) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => callback(value), delay)
  })

  return { query }
}
