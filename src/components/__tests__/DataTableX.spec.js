import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTableX from '@/components/encapsulate/DataTableX.vue'

test('mounts client mode', async () => {
  const wrapper = mount(DataTableX, {
    props: {
      rows: [ { name: 'a', age: 20 }, { name: 'b', age: 30 } ],
      columns: [ { label: 'name', prop: 'name' }, { label: 'age', prop: 'age' } ],
      pagination: { mode: 'client', pageSize: 10, currentPage: 1 }
    }
  })
  expect(wrapper.exists()).toBe(true)
})

test('mounts server mode', async () => {
  const wrapper = mount(DataTableX, {
    props: {
      rows: [{ name: 'a', age: 20 }],
      columns: [{ label: 'name', prop: 'name' }],
      pagination: { mode: 'server', pageSize: 10, currentPage: 1, total: 100 }
    }
  })
  expect(wrapper.exists()).toBe(true)
})