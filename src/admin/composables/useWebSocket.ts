import { onBeforeUnmount, ref } from 'vue'

export function useWebSocket(url = 'wss://example.invalid/admin-alerts') {
  const isConnected = ref(false)

  const connect = () => {
    isConnected.value = false
  }

  const disconnect = () => {
    isConnected.value = false
  }

  onBeforeUnmount(disconnect)

  return { url, isConnected, connect, disconnect }
}
