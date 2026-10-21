import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CountdownRing from './CountdownRing.vue'

describe('CountdownRing', () => {
  it('shows the remaining whole seconds, rounded up', () => {
    const wrapper = mount(CountdownRing, { props: { remainingMs: 4200, totalMs: 5000 } })

    expect(wrapper.text()).toContain('5')
  })

  it('switches to the warning color in the last 2 seconds', () => {
    const wrapper = mount(CountdownRing, { props: { remainingMs: 1500, totalMs: 5000 } })

    expect(wrapper.find('span.text-warning').exists()).toBe(true)
  })

  it('does not use the warning color above 2 seconds remaining', () => {
    const wrapper = mount(CountdownRing, { props: { remainingMs: 3000, totalMs: 5000 } })

    expect(wrapper.find('span.text-warning').exists()).toBe(false)
  })
})
