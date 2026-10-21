import { apiClient } from '@/api/client'
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/api'

export async function fetchLeaderboard(slug: string, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get<LeaderboardEntry[]>(`/leaderboard/${slug}/`, {
    params: { period },
  })
  return response.data
}
