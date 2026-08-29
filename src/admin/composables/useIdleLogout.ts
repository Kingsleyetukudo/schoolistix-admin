import { onBeforeUnmount, onMounted } from 'vue'

const ACTIVITY_EVENTS = [
  'pointerdown',
  'keydown',
  'mousemove',
  'wheel',
  'touchstart',
] as const

type UseIdleLogoutOptions = {
  timeoutMs: number
  onIdle: () => void
}

export function useIdleLogout({ timeoutMs, onIdle }: UseIdleLogoutOptions) {
  let timer: number | null = null
  let lastActivityAt = Date.now()

  const clearTimer = () => {
    if (timer !== null && typeof window !== 'undefined') {
      window.clearTimeout(timer)
      timer = null
    }
  }

  const startTimer = () => {
    clearTimer()
    timer = window.setTimeout(onIdle, timeoutMs)
  }

  const resetTimer = () => {
    lastActivityAt = Date.now()
    startTimer()
  }

  const handleActivity = () => {
    resetTimer()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return
    if (Date.now() - lastActivityAt >= timeoutMs) {
      clearTimer()
      onIdle()
      return
    }
    startTimer()
  }

  onMounted(() => {
    resetTimer()
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    clearTimer()
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, handleActivity)
    })
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
}