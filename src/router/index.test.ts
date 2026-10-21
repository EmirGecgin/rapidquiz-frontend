import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'
import tr from '@/i18n'
import router from '@/router'

describe('router', () => {
  it.each([
    ['/', tr.home.title],
    ['/play/tarih', tr.play.title],
    ['/result', tr.result.title],
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
})
