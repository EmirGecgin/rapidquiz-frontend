export type Platform = 'web' | 'ios' | 'android'

export type ApiErrorCode =
  | 'invalid_token'
  | 'session_expired'
  | 'session_finished'
  | 'question_mismatch'
  | 'already_answered'
  | 'invalid_name'
  | 'rate_limited'
  | 'not_found'
  | 'validation_error'
  | 'network_error'

export interface ApiErrorBody {
  code: ApiErrorCode
  message: string
}

export interface Category {
  name: string
  slug: string
  icon: string
  color: string
  question_count: number
}

export interface StartSessionResponse {
  session_id: string
  token: string
  total_questions: number
  time_limit_ms: number
}

export interface Choice {
  id: number
  text: string
}

export type NextQuestionResponse =
  | { done: true }
  | {
      index: number
      question_id: number
      text: string
      choices: Choice[]
      time_limit_ms: number
    }

export interface AnswerResponse {
  is_correct: boolean
  correct_choice_id: number
  points: number
  score: number
  elapsed_ms: number
}

export interface FinishResponse {
  score: number
  rank: number
  correct_count: number
}

export interface LeaderboardEntry {
  rank: number
  player_name: string
  score: number
  correct_count: number
  finished_at: string
}

export type LeaderboardPeriod = 'day' | 'week' | 'all'
