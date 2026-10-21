import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down to zero and calls onComplete once', async () => {
    const onComplete = vi.fn()
    const countdown = useCountdown({ onComplete })
    countdown.start(5000)

    expect(countdown.remainingMs.value).toBe(5000)

    await vi.advanceTimersByTimeAsync(2000)
    expect(countdown.remainingMs.value).toBeLessThanOrEqual(3000)
    expect(onComplete).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(3100)
    expect(countdown.remainingMs.value).toBe(0)
    expect(onComplete).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('stop() cancels the countdown before it completes', async () => {
    const onComplete = vi.fn()
    const countdown = useCountdown({ onComplete })
    countdown.start(5000)

    await vi.advanceTimersByTimeAsync(1000)
    countdown.stop()

    await vi.advanceTimersByTimeAsync(5000)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('keeps ticking toward the real elapsed time even if frames are skipped', async () => {
    const onComplete = vi.fn()
    const countdown = useCountdown({ onComplete })
    countdown.start(5000)

    // +20ms buffer: fake rAF ticks on a fixed frame interval, so the exact
    // duration can land between two scheduled frames.
    await vi.advanceTimersByTimeAsync(5020)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(countdown.remainingMs.value).toBe(0)
  })
})
