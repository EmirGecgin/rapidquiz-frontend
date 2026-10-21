import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ChoiceButton from './ChoiceButton.vue'

describe('ChoiceButton', () => {
  it('shows a checkmark and success styling when correct', () => {
    const wrapper = mount(ChoiceButton, { props: { text: 'A', state: 'correct' } })

    expect(wrapper.text()).toContain('✓')
    expect(wrapper.classes()).toContain('border-success')
  })

  it('shows an X and danger styling when incorrect', () => {
    const wrapper = mount(ChoiceButton, { props: { text: 'B', state: 'incorrect' } })

    expect(wrapper.text()).toContain('✗')
    expect(wrapper.classes()).toContain('border-danger')
  })

  it('emits click when enabled and not when disabled', async () => {
    const wrapper = mount(ChoiceButton, { props: { text: 'A', state: 'idle', disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()

    await wrapper.setProps({ disabled: false })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
