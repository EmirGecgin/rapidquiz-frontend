import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

import CategoryCard from '@/components/CategoryCard.vue'
import type { Category } from '@/types/api'

const category: Category = {
  name: 'Tarih',
  slug: 'tarih',
  icon: 'landmark',
  color: '#E8B4A0',
  question_count: 30,
}

async function mountCard() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/play/:slug', name: 'play', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  await router.isReady()

  return mount(CategoryCard, {
    props: { category },
    global: { plugins: [router] },
  })
}

describe('CategoryCard', () => {
  it('shows the category name and question count', async () => {
    const wrapper = await mountCard()

    expect(wrapper.text()).toContain('Tarih')
    expect(wrapper.text()).toContain('30 soru')
  })

  it('links to the play route for its category', async () => {
    const wrapper = await mountCard()

    expect(wrapper.get('a').attributes('href')).toBe('/play/tarih')
  })
})
