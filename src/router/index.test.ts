import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '@/App.vue'
import tr from '@/i18n'
import router from '@/router'
import PlayView from '@/views/PlayView.vue'
import ResultView from '@/views/ResultView.vue'

// Oyun/sonuç state'i yalnızca Pinia'da (bellekte) tutulur; `/play` ve `/result`
// taze yüklendiğinde (yenileme dahil) ana sayfaya düşer. Yeni bir router'ın İLK
// navigasyonunda `from` her zaman eşleşmemiş (matched: []) başlangıç rotasıdır —
// tıpkı sayfa doğrudan açıldığında/yenilendiğinde olduğu gibi — bunu izole bir
// router örneğiyle test ediyoruz.
function freshLoadGuard(_to: unknown, from: { matched: unknown[] }) {
  return from.matched.length === 0 ? { name: 'home' } : true
}

function createGuardedRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/play/:slug', name: 'play', component: PlayView, props: true, beforeEnter: freshLoadGuard },
      { path: '/result', name: 'result', component: ResultView, beforeEnter: freshLoadGuard },
    ],
  })
}

describe('router', () => {
  it.each([
    ['/', tr.home.title],
    ['/leaderboard/tarih', tr.leaderboard.title],
  ])('renders the view mapped to %s', async (path, expectedText) => {
    await router.push(path)

    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
      },
    })

    expect(wrapper.text()).toContain(expectedText)
  })

  it('redirects a fresh load of /play/:slug to home', async () => {
    const freshRouter = createGuardedRouter()
    await freshRouter.push('/play/tarih')

    expect(freshRouter.currentRoute.value.name).toBe('home')
  })

  it('redirects a fresh load of /result to home', async () => {
    const freshRouter = createGuardedRouter()
    await freshRouter.push('/result')

    expect(freshRouter.currentRoute.value.name).toBe('home')
  })

  it('allows navigating to /play/:slug from within the app', async () => {
    const freshRouter = createGuardedRouter()
    await freshRouter.push('/')
    await freshRouter.push('/play/tarih')

    expect(freshRouter.currentRoute.value.name).toBe('play')
  })
})
