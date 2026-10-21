import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import type { Category, LeaderboardEntry } from '@/types/api'

const fetchLeaderboard = vi.fn<() => Promise<LeaderboardEntry[]>>()
const fetchCategories = vi.fn<() => Promise<Category[]>>()

vi.mock('@/api/leaderboard', () => ({
  fetchLeaderboard: (...args: unknown[]) => fetchLeaderboard(...(args as [])),
}))
vi.mock('@/api/catalog', () => ({
  fetchCategories: () => fetchCategories(),
}))

import LeaderboardView from './LeaderboardView.vue'

const entries: LeaderboardEntry[] = [
  { rank: 1, player_name: 'Birinci', score: 140, correct_count: 10, finished_at: '2026-10-21T10:00:00Z' },
  { rank: 2, player_name: 'İkinci', score: 100, correct_count: 8, finished_at: '2026-10-21T10:00:00Z' },
  { rank: 3, player_name: 'Üçüncü', score: 90, correct_count: 7, finished_at: '2026-10-21T10:00:00Z' },
  { rank: 4, player_name: 'Dördüncü', score: 80, correct_count: 6, finished_at: '2026-10-21T10:00:00Z' },
]

const category: Category = { name: 'Tarih', slug: 'tarih', icon: 'landmark', color: '#E8B4A0', question_count: 30 }

async function mountLeaderboard(query: Record<string, string> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/leaderboard/:slug', name: 'leaderboard', component: LeaderboardView, props: true }],
  })
  await router.push({ name: 'leaderboard', params: { slug: 'tarih' }, query })

  const wrapper = mount(LeaderboardView, {
    props: { slug: 'tarih' },
    global: { plugins: [router] },
  })
  await flushPromises()
  return wrapper
}

describe('LeaderboardView', () => {
  beforeEach(() => {
    fetchLeaderboard.mockReset().mockResolvedValue(entries)
    fetchCategories.mockReset().mockResolvedValue([category])
  })

  it('shows the category name and ranked entries with medals', async () => {
    const wrapper = await mountLeaderboard()

    expect(wrapper.text()).toContain('Tarih')
    expect(wrapper.text()).toContain('🥇')
    expect(wrapper.text()).toContain('🥈')
    expect(wrapper.text()).toContain('🥉')
    expect(wrapper.text()).toContain('Birinci')
    expect(wrapper.text()).toContain('Dördüncü')
  })

  it('fetches with period=all by default', async () => {
    await mountLeaderboard()

    expect(fetchLeaderboard).toHaveBeenCalledWith('tarih', 'all')
  })

  it('switches period and refetches when a tab is clicked', async () => {
    const wrapper = await mountLeaderboard()

    await wrapper.findAll('button[role="tab"]')[0].trigger('click')
    await flushPromises()

    expect(fetchLeaderboard).toHaveBeenLastCalledWith('tarih', 'day')
  })

  it('highlights the row matching the highlight query param', async () => {
    const wrapper = await mountLeaderboard({ highlight: '2' })

    const rows = wrapper.findAll('li')
    expect(rows[1].classes()).toContain('ring-2')
    expect(rows[0].classes()).not.toContain('ring-2')
  })

  it('shows an empty state when there are no entries', async () => {
    fetchLeaderboard.mockResolvedValue([])
    const wrapper = await mountLeaderboard()

    expect(wrapper.text()).toContain('Henüz kimse yok')
  })

  it('shows an error state with retry on failure', async () => {
    fetchLeaderboard.mockRejectedValueOnce(new ApiError('not_found', 'Bulunamadı.'))
    const wrapper = await mountLeaderboard()

    expect(wrapper.text()).toContain('Bulunamadı.')

    fetchLeaderboard.mockResolvedValueOnce(entries)
    await wrapper.get('button:not([role="tab"])').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Birinci')
  })
})
