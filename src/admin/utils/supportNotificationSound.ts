let audioContext: AudioContext | null = null
let unlockListenersInstalled = false
let removeUnlockListeners: (() => void) | null = null

const canUseWebAudio = () =>
  typeof window !== 'undefined' &&
  typeof (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) !== 'undefined'

const getAudioContext = (): AudioContext | null => {
  if (!canUseWebAudio()) return null

  if (!audioContext) {
    const Context =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    audioContext = Context ? new Context() : null
  }

  return audioContext
}

const clearUnlockListeners = () => {
  removeUnlockListeners?.()
  removeUnlockListeners = null
  unlockListenersInstalled = false
}

const resumeAudioContext = async (): Promise<AudioContext | null> => {
  const context = getAudioContext()
  if (!context) return null

  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return null
    }
  }

  if (context.state === 'running') {
    clearUnlockListeners()
    return context
  }

  return null
}

export const installSupportNotificationSound = () => {
  if (!canUseWebAudio() || unlockListenersInstalled) return

  const unlock = () => {
    void resumeAudioContext()
  }

  const options: AddEventListenerOptions = { passive: true }
  window.addEventListener('pointerdown', unlock, options)
  window.addEventListener('keydown', unlock, options)
  window.addEventListener('touchstart', unlock, options)

  removeUnlockListeners = () => {
    window.removeEventListener('pointerdown', unlock, options)
    window.removeEventListener('keydown', unlock, options)
    window.removeEventListener('touchstart', unlock, options)
  }

  unlockListenersInstalled = true
}

export const playSupportNotificationSound = async () => {
  installSupportNotificationSound()

  const context = await resumeAudioContext()
  if (!context) return false

  const now = context.currentTime
  const gain = context.createGain()
  gain.connect(context.destination)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)

  const oscillator = context.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(784, now)
  oscillator.frequency.exponentialRampToValueAtTime(1046, now + 0.12)
  oscillator.connect(gain)
  oscillator.start(now)
  oscillator.stop(now + 0.24)

  return true
}
