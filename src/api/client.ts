import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useSessionStore } from '@/stores/session'
import type { ApiErrorBody, ApiErrorCode } from '@/types/api'

export class ApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export function attachSessionToken(config: InternalAxiosRequestConfig) {
  const sessionStore = useSessionStore()
  if (sessionStore.token) {
    config.headers.set('X-Session-Token', sessionStore.token)
  }
  return config
}

export function mapError(error: AxiosError<{ error?: ApiErrorBody }>) {
  const body = error.response?.data?.error
  if (body) {
    return Promise.reject(new ApiError(body.code, body.message))
  }
  return Promise.reject(new ApiError('network_error', 'Sunucuya bağlanılamadı.'))
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use(attachSessionToken)
apiClient.interceptors.response.use((response) => response, mapError)
