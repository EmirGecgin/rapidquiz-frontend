import { defineStore } from 'pinia'
import { ref } from 'vue'

import { fetchNextQuestion, startSession, submitAnswer as submitAnswerRequest } from '@/api/game'
import { ApiError } from '@/api/client'
import { useSessionStore } from '@/stores/session'
import type { Choice, Platform } from '@/types/api'

export type QuizPhase = 'idle' | 'loading' | 'question' | 'feedback' | 'done' | 'error'

const FEEDBACK_DELAY_MS = 1000

export const useQuizStore = defineStore('quiz', () => {
  const phase = ref<QuizPhase>('idle')
  const totalQuestions = ref(0)
  const timeLimitMs = ref(5000)
  const index = ref(0)
  const questionId = ref<number | null>(null)
  const questionText = ref('')
  const choices = ref<Choice[]>([])
  const score = ref(0)
  const correctCount = ref(0)
  const selectedChoiceId = ref<number | null>(null)
  const correctChoiceId = ref<number | null>(null)
  const isCorrect = ref(false)
  const errorMessage = ref('')

  let feedbackTimer: ReturnType<typeof setTimeout> | null = null

  function clearFeedbackTimer() {
    if (feedbackTimer !== null) {
      clearTimeout(feedbackTimer)
      feedbackTimer = null
    }
  }

  async function start(categorySlug: string, platform: Platform = 'web') {
    const sessionStore = useSessionStore()
    phase.value = 'loading'
    score.value = 0
    correctCount.value = 0
    index.value = 0

    try {
      const data = await startSession(categorySlug, platform)
      sessionStore.start({ sessionId: data.session_id, token: data.token, categorySlug })
      totalQuestions.value = data.total_questions
      timeLimitMs.value = data.time_limit_ms
    } catch (error) {
      setError(error)
    }
  }

  async function loadNext() {
    const sessionStore = useSessionStore()
    if (!sessionStore.sessionId) return

    phase.value = 'loading'
    try {
      const data = await fetchNextQuestion(sessionStore.sessionId)
      if (data.done) {
        phase.value = 'done'
        return
      }

      index.value = data.index
      questionId.value = data.question_id
      questionText.value = data.text
      choices.value = data.choices
      timeLimitMs.value = data.time_limit_ms
      selectedChoiceId.value = null
      correctChoiceId.value = null
      phase.value = 'question'
    } catch (error) {
      setError(error)
    }
  }

  async function submitAnswer(choiceId: number | null) {
    const sessionStore = useSessionStore()
    if (phase.value !== 'question' || !sessionStore.sessionId || questionId.value === null) return

    selectedChoiceId.value = choiceId
    phase.value = 'feedback'

    try {
      const data = await submitAnswerRequest(sessionStore.sessionId, questionId.value, choiceId)
      correctChoiceId.value = data.correct_choice_id
      isCorrect.value = data.is_correct
      score.value = data.score
      if (data.is_correct) correctCount.value += 1

      clearFeedbackTimer()
      feedbackTimer = setTimeout(() => {
        loadNext()
      }, FEEDBACK_DELAY_MS)
    } catch (error) {
      setError(error)
    }
  }

  function setError(error: unknown) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Beklenmeyen bir hata oluştu.'
    phase.value = 'error'
  }

  function reset() {
    clearFeedbackTimer()
    phase.value = 'idle'
    index.value = 0
    questionId.value = null
    questionText.value = ''
    choices.value = []
    score.value = 0
    correctCount.value = 0
    selectedChoiceId.value = null
    correctChoiceId.value = null
    errorMessage.value = ''
    useSessionStore().clear()
  }

  return {
    phase,
    totalQuestions,
    timeLimitMs,
    index,
    questionId,
    questionText,
    choices,
    score,
    correctCount,
    selectedChoiceId,
    correctChoiceId,
    isCorrect,
    errorMessage,
    start,
    loadNext,
    submitAnswer,
    reset,
  }
})
