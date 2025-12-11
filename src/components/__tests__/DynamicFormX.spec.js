import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicFormX from '@/components/encapsulate/DynamicFormX.vue'

test('renders schema fields', async () => {
  const wrapper = mount(DynamicFormX, {
    props: {
      schema: [
        { type: 'input', label: 'name', model: 'name' },
        { type: 'select', label: 'city', model: 'city', options: ['a','b'] }
      ],
      rules: { name: [{ required: true, message: 'r', trigger: 'blur' }] },
      modelValue: { name: 'x' }
    }
  })
  expect(wrapper.exists()).toBe(true)
})