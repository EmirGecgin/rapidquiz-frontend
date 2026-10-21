import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useSessionStore } from '@/stores/session'

import { ApiError, attachSessionToken, mapError } from './client'

describe('attachSessionToken', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('attaches X-Session-Token when a session token is set', () => {
    const sessionStore = useSessionStore()
    sessionStore.start({ sessionId: 's1', token: 'tok123', categorySlug: 'tarih' })

    const headers = new Map<string, string>()
    const config = { headers: { set: (key: string, value: string) => headers.set(key, value) } } as never

    attachSessionToken(config)

    expect(headers.get('X-Session-Token')).toBe('tok123')
  })

  it('does not set a header when there is no session token', () => {
    const headers = new Map<string, string>()
    const config = { headers: { set: (key: string, value: string) => headers.set(key, value) } } as never

    attachSessionToken(config)

    expect(headers.size).toBe(0)
  })
})

describe('mapError', () => {
  it('maps a backend error envelope to an ApiError', async () => {
    const error = {
      response: { data: { error: { code: 'invalid_token', message: 'Geçersiz oturum anahtarı.' } } },
    } as never

    await expect(mapError(error)).rejects.toEqual(new ApiError('invalid_token', 'Geçersiz oturum anahtarı.'))
  })

  it('falls back to network_error when there is no error envelope', async () => {
    const error = { response: undefined } as never

    await expect(mapError(error)).rejects.toMatchObject({ code: 'network_error' })
  })
})
