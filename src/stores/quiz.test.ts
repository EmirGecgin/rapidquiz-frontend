import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AnswerResponse, NextQuestionResponse, StartSessionResponse } from '@/types/api'

const startSession = vi.fn<() => Promise<StartSessionResponse>>()
const fetchNextQuestion = vi.fn<() => Promise<NextQuestionResponse>>()
const submitAnswer = vi.fn<() => Promise<AnswerResponse>>()

vi.mock('@/api/game', () => ({
  startSession: (...args: unknown[]) => startSession(...(args as [])),
  fetchNextQuestion: (...args: unknown[]) => fetchNextQuestion(...(args as [])),
  submitAnswer: (...args: unknown[]) => submitAnswer(...(args as [])),
}))

import { useQuizStore } from './quiz'
import { useSessionStore } from './session'

const question = {
  index: 0,
  question_id: 1,
  text: 'Soru?',
  choices: [
    { id: 10, text: 'A' },
    { id: 11, text: 'B' },
  ],
  time_limit_ms: 5000,
}

describe('useQuizStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    startSession.mockReset()
    fetchNextQuestion.mockReset()
    submitAnswer.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts a session and stores the token in the session store', async () => {
    startSession.mockResolvedValue({
      session_id: 's1',
      token: 'tok',
      total_questions: 10,
      time_limit_ms: 5000,
    })

    const quiz = useQuizStore()
    await quiz.start('tarih')

    const sessionStore = useSessionStore()
    expect(sessionStore.sessionId).toBe('s1')
    expect(sessionStore.token).toBe('tok')
    expect(quiz.totalQuestions).toBe(10)
  })

  it('loads the next question into state', async () => {
    const quiz = useQuizStore()
    useSessionStore().start({ sessionId: 's1', token: 'tok', categorySlug: 'tarih' })

    fetchNextQuestion.mockResolvedValue(question)
    await quiz.loadNext()

    expect(quiz.phase).toBe('question')
    expect(quiz.questionId).toBe(1)
    expect(quiz.choices).toHaveLength(2)
  })

  it('moves to done when next reports done', async () => {
    const quiz = useQuizStore()
    useSessionStore().start({ sessionId: 's1', token: 'tok', categorySlug: 'tarih' })

    fetchNextQuestion.mockResolvedValue({ done: true })
    await quiz.loadNext()

    expect(quiz.phase).toBe('done')
  })

  it('submits an answer, updates score, then auto-advances after the feedback delay', async () => {
    vi.useFakeTimers()

    const quiz = useQuizStore()
    useSessionStore().start({ sessionId: 's1', token: 'tok', categorySlug: 'tarih' })
    fetchNextQuestion.mockResolvedValue(question)
    await quiz.loadNext()

    submitAnswer.mockResolvedValue({
      is_correct: true,
      correct_choice_id: 10,
      points: 14,
      score: 14,
      elapsed_ms: 500,
    })

    await quiz.submitAnswer(10)

    expect(quiz.phase).toBe('feedback')
    expect(quiz.score).toBe(14)
    expect(quiz.correctChoiceId).toBe(10)

    fetchNextQuestion.mockResolvedValue({ ...question, index: 1, question_id: 2 })
    await vi.advanceTimersByTimeAsync(1000)

    expect(fetchNextQuestion).toHaveBeenCalledTimes(2)
    expect(quiz.phase).toBe('question')
    expect(quiz.questionId).toBe(2)
  })

  it('ignores submitAnswer calls outside the question phase', async () => {
    const quiz = useQuizStore()
    await quiz.submitAnswer(10)

    expect(submitAnswer).not.toHaveBeenCalled()
  })

  it('sets phase to error when an API call fails', async () => {
    const quiz = useQuizStore()
    useSessionStore().start({ sessionId: 's1', token: 'tok', categorySlug: 'tarih' })

    const { ApiError } = await import('@/api/client')
    fetchNextQuestion.mockRejectedValue(new ApiError('session_expired', 'Oturumun süresi doldu.'))

    await quiz.loadNext()

    expect(quiz.phase).toBe('error')
    expect(quiz.errorMessage).toBe('Oturumun süresi doldu.')
  })
})
