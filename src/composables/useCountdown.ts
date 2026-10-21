import { onUnmounted, ref } from 'vue'

export interface UseCountdownOptions {
  onComplete: () => void
}

export function useCountdown(options: UseCountdownOptions) {
  const remainingMs = ref(0)
  const isRunning = ref(false)

  let durationMs = 0
  let startedAt = 0
  let rafId: number | null = null
  let completed = false

  function tick() {
    const elapsed = performance.now() - startedAt
    const remaining = Math.max(0, durationMs - elapsed)
    remainingMs.value = remaining

    if (remaining <= 0) {
      stop()
      if (!completed) {
        completed = true
        options.onComplete()
      }
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  function start(duration: number) {
    stop()
    durationMs = duration
    remainingMs.value = duration
    startedAt = performance.now()
    completed = false
    isRunning.value = true
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    isRunning.value = false
  }

  onUnmounted(stop)

  return { remainingMs, isRunning, start, stop }
}
