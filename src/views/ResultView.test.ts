import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { FinishResponse } from '@/types/api'

const finishSession = vi.fn<() => Promise<FinishResponse>>()
vi.mock('@/api/game', () => ({
  finishSession: (...args: unknown[]) => finishSession(...(args as [])),
}))

import { useQuizStore } from '@/stores/quiz'
import { useSessionStore } from '@/stores/session'

import ResultView from './ResultView.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/play/:slug', name: 'play', component: { template: '<div />' }, props: true },
      { path: '/result', name: 'result', component: ResultView },
      { path: '/leaderboard/:slug', name: 'leaderboard', component: { template: '<div />' }, props: true },
    ],
  })
}

async function mountResult() {
  setActivePinia(createPinia())
  const sessionStore = useSessionStore()
  sessionStore.start({ sessionId: 's1', token: 'tok', categorySlug: 'tarih' })

  const quiz = useQuizStore()
  quiz.score = 90
  quiz.correctCount = 7

  const router = createTestRouter()
  await router.push('/result')

  const wrapper = mount(ResultView, { global: { plugins: [router] } })
  return { wrapper, router, quiz, sessionStore }
}

describe('ResultView', () => {
  beforeEach(() => {
    finishSession.mockReset()
  })

  it('shows the final score and correct count', async () => {
    const { wrapper } = await mountResult()

    expect(wrapper.text()).toContain('90')
    expect(wrapper.text()).toContain('7')
  })

  it('submits the name and navigates to the leaderboard with the rank highlighted', async () => {
    finishSession.mockResolvedValue({ score: 90, rank: 2, correct_count: 7 })
    const { wrapper, router } = await mountResult()

    await wrapper.get('input').setValue('Ahmet')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('leaderboard')
    expect(router.currentRoute.value.params.slug).toBe('tarih')
    expect(router.currentRoute.value.query.highlight).toBe('2')
  })

  it('shows an error and stays on the page when finish fails', async () => {
    const { ApiError } = await import('@/api/client')
    finishSession.mockRejectedValue(new ApiError('invalid_name', 'Geçersiz isim.'))
    const { wrapper, router } = await mountResult()

    await wrapper.get('input').setValue('a')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Geçersiz isim.')
    expect(router.currentRoute.value.name).toBe('result')
  })

  it('"tekrar oyna" navigates back to the play route for the same category', async () => {
    const { wrapper, router } = await mountResult()

    await wrapper.get('button[type="button"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('play')
    expect(router.currentRoute.value.params.slug).toBe('tarih')
  })
})
