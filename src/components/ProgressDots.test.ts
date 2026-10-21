import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ProgressDots from './ProgressDots.vue'

describe('ProgressDots', () => {
  it('renders one dot per total question', () => {
    const wrapper = mount(ProgressDots, { props: { total: 10, completed: 3 } })

    expect(wrapper.findAll('span[class*="rounded-full"]')).toHaveLength(10)
  })

  it('exposes the current progress for assistive tech', () => {
    const wrapper = mount(ProgressDots, { props: { total: 10, completed: 3 } })

    expect(wrapper.attributes('aria-label')).toBe('4 / 10')
  })
})
