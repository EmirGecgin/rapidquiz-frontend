import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useSessionStore } from './session'

describe('useSessionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    const store = useSessionStore()

    expect(store.sessionId).toBeNull()
    expect(store.token).toBeNull()
    expect(store.categorySlug).toBeNull()
  })

  it('stores session details on start and clears them on clear', () => {
    const store = useSessionStore()

    store.start({ sessionId: 's1', token: 'tok123', categorySlug: 'tarih' })
    expect(store.sessionId).toBe('s1')
    expect(store.token).toBe('tok123')
    expect(store.categorySlug).toBe('tarih')

    store.clear()
    expect(store.sessionId).toBeNull()
    expect(store.token).toBeNull()
    expect(store.categorySlug).toBeNull()
  })

  it('persists the last player name to localStorage', () => {
    const store = useSessionStore()

    store.rememberPlayerName('Ahmet')

    expect(store.lastPlayerName).toBe('Ahmet')
    expect(localStorage.getItem('rapidquiz:lastPlayerName')).toBe('Ahmet')
  })
})
