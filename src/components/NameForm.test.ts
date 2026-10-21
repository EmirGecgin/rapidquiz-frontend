import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import NameForm from './NameForm.vue'

describe('NameForm', () => {
  it('emits update:modelValue as the user types', async () => {
    const wrapper = mount(NameForm, { props: { modelValue: '', submitting: false, errorMessage: '' } })

    await wrapper.get('input').setValue('Ahmet')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Ahmet'])
  })

  it('emits submit when the form is submitted', async () => {
    const wrapper = mount(NameForm, { props: { modelValue: 'Ahmet', submitting: false, errorMessage: '' } })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('disables the submit button while submitting', () => {
    const wrapper = mount(NameForm, { props: { modelValue: 'Ahmet', submitting: true, errorMessage: '' } })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('shows the error message when present', () => {
    const wrapper = mount(NameForm, {
      props: { modelValue: 'a', submitting: false, errorMessage: 'Geçersiz isim.' },
    })

    expect(wrapper.text()).toContain('Geçersiz isim.')
  })
})
