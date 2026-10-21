import { defineStore } from 'pinia'
import { ref } from 'vue'

const LAST_NAME_KEY = 'rapidquiz:lastPlayerName'

function readLastPlayerName(): string {
  try {
    return localStorage.getItem(LAST_NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeLastPlayerName(name: string) {
  try {
    localStorage.setItem(LAST_NAME_KEY, name)
  } catch {
    // localStorage kullanılamıyor (gizli sekme vb.) — sessizce yut.
  }
}

export const useSessionStore = defineStore('session', () => {
  const sessionId = ref<string | null>(null)
  const token = ref<string | null>(null)
  const categorySlug = ref<string | null>(null)
  const lastPlayerName = ref(readLastPlayerName())

  function start(payload: { sessionId: string; token: string; categorySlug: string }) {
    sessionId.value = payload.sessionId
    token.value = payload.token
    categorySlug.value = payload.categorySlug
  }

  function clear() {
    sessionId.value = null
    token.value = null
    categorySlug.value = null
  }

  function rememberPlayerName(name: string) {
    lastPlayerName.value = name
    writeLastPlayerName(name)
  }

  return { sessionId, token, categorySlug, lastPlayerName, start, clear, rememberPlayerName }
})
