import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import type { AnswerResponse, NextQuestionResponse, StartSessionResponse } from '@/types/api'

const startSession = vi.fn<() => Promise<StartSessionResponse>>()
const fetchNextQuestion = vi.fn<() => Promise<NextQuestionResponse>>()
const submitAnswer = vi.fn<() => Promise<AnswerResponse>>()

vi.mock('@/api/game', () => ({
  startSession: (...args: unknown[]) => startSession(...(args as [])),
  fetchNextQuestion: (...args: unknown[]) => fetchNextQuestion(...(args as [])),
  submitAnswer: (...args: unknown[]) => submitAnswer(...(args as [])),
}))

import PlayView from './PlayView.vue'

const firstQuestion = {
  index: 0,
  question_id: 1,
  text: 'İlk soru?',
  choices: [
    { id: 10, text: 'A' },
    { id: 11, text: 'B' },
  ],
  time_limit_ms: 5000,
}

const secondQuestion = {
  index: 1,
  question_id: 2,
  text: 'İkinci soru?',
  choices: [
    { id: 20, text: 'C' },
    { id: 21, text: 'D' },
  ],
  time_limit_ms: 5000,
}

function createTestRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/play/:slug', name: 'play', component: PlayView, props: true },
      { path: '/result', name: 'result', component: { template: '<div />' } },
    ],
  })
}

async function mountAtPlay() {
  const router = createTestRouter()
  await router.push('/')
  await router.push('/play/tarih')

  const wrapper = mount({ template: '<router-view />' }, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('PlayView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })

    startSession.mockReset().mockResolvedValue({
      session_id: 's1',
      token: 'tok',
      total_questions: 2,
      time_limit_ms: 5000,
    })
    fetchNextQuestion.mockReset()
    submitAnswer.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs a 3-2-1 intro before loading the first question', async () => {
    fetchNextQuestion.mockResolvedValue(firstQuestion)
    const { wrapper } = await mountAtPlay()
    await flushPromises()

    expect(wrapper.text()).toContain('3')

    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.text()).toContain('2')

    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.text()).toContain('1')

    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(wrapper.text()).toContain('İlk soru?')
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')
  })

  it('selecting a choice with the keyboard (1-4) submits that answer', async () => {
    fetchNextQuestion.mockResolvedValueOnce(firstQuestion)
    submitAnswer.mockResolvedValue({
      is_correct: true,
      correct_choice_id: 10,
      points: 14,
      score: 14,
      elapsed_ms: 500,
    })

    await mountAtPlay()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    await flushPromises()

    expect(submitAnswer).toHaveBeenCalledWith('s1', 1, 10)
  })

  it('shows feedback then auto-advances to the next question after 1s', async () => {
    fetchNextQuestion.mockResolvedValueOnce(firstQuestion)
    submitAnswer.mockResolvedValue({
      is_correct: false,
      correct_choice_id: 11,
      points: -5,
      score: 0,
      elapsed_ms: 1000,
    })

    const { wrapper } = await mountAtPlay()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    await flushPromises()

    expect(wrapper.text()).toContain('İlk soru?')

    fetchNextQuestion.mockResolvedValueOnce(secondQuestion)
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(wrapper.text()).toContain('İkinci soru?')
  })

  it('navigates to /result once the round is done', async () => {
    fetchNextQuestion.mockResolvedValue({ done: true })

    const { wrapper, router } = await mountAtPlay()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('result')
    expect(wrapper).toBeTruthy()
  })
})
