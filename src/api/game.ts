import { apiClient } from '@/api/client'
import type { AnswerResponse, NextQuestionResponse, Platform, StartSessionResponse } from '@/types/api'

export async function startSession(
  categorySlug: string,
  platform: Platform = 'web',
): Promise<StartSessionResponse> {
  const response = await apiClient.post<StartSessionResponse>('/sessions/', {
    category: categorySlug,
    platform,
  })
  return response.data
}

export async function fetchNextQuestion(sessionId: string): Promise<NextQuestionResponse> {
  const response = await apiClient.post<NextQuestionResponse>(`/sessions/${sessionId}/next/`)
  return response.data
}

export async function submitAnswer(
  sessionId: string,
  questionId: number,
  choiceId: number | null,
): Promise<AnswerResponse> {
  const response = await apiClient.post<AnswerResponse>(`/sessions/${sessionId}/answer/`, {
    question_id: questionId,
    choice_id: choiceId,
  })
  return response.data
}
