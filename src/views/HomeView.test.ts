import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

import { ApiError } from '@/api/client'
import CategoryCard from '@/components/CategoryCard.vue'
import type { Category } from '@/types/api'

const fetchCategories = vi.fn<() => Promise<Category[]>>()
vi.mock('@/api/catalog', () => ({
  fetchCategories: () => fetchCategories(),
}))

import HomeView from './HomeView.vue'

const category: Category = {
  name: 'Tarih',
  slug: 'tarih',
  icon: 'landmark',
  color: '#E8B4A0',
  question_count: 30,
}

async function mountHome() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/play/:slug', name: 'play', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  await router.isReady()

  return mount(HomeView, { global: { plugins: [router] } })
}

describe('HomeView', () => {
  beforeEach(() => {
    fetchCategories.mockReset()
  })

  it('shows a loading state before categories resolve', async () => {
    fetchCategories.mockReturnValue(new Promise(() => {}))

    const wrapper = await mountHome()

    expect(wrapper.text()).toContain('Kategoriler yükleniyor')
  })

  it('renders a card per category once loaded', async () => {
    fetchCategories.mockResolvedValue([category])

    const wrapper = await mountHome()
    await flushPromises()

    expect(wrapper.findAllComponents(CategoryCard)).toHaveLength(1)
    expect(wrapper.text()).toContain('Tarih')
  })

  it('shows an error state with retry on failure, and recovers on retry', async () => {
    fetchCategories.mockRejectedValueOnce(new ApiError('not_found', 'Bulunamadı.'))

    const wrapper = await mountHome()
    await flushPromises()

    expect(wrapper.text()).toContain('Bulunamadı.')

    fetchCategories.mockResolvedValueOnce([category])
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Tarih')
  })
})
