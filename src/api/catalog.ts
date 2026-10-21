import { apiClient } from '@/api/client'
import type { Category } from '@/types/api'

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories/')
  return response.data
}
