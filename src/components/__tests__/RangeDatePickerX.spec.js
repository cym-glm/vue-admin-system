import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RangeDatePickerX from '@/components/encapsulate/RangeDatePickerX.vue'

test('mounts with default shortcuts', async () => {
  const wrapper = mount(RangeDatePickerX, { props: { modelValue: null } })
  expect(wrapper.exists()).toBe(true)
})