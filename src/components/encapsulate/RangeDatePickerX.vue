<template>
  <el-date-picker
    v-model="innerValue"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    :disabled-date="disabledDate"
    :shortcuts="computedShortcuts"
    unlink-panels
    range-separator="至"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Array], default: null },
  type: { type: String, default: 'daterange' },
  format: { type: String, default: 'YYYY-MM-DD' },
  valueFormat: { type: String, default: 'YYYY-MM-DD' },
  disabledDate: { type: Function, default: null },
  shortcuts: { type: Array, default: null }
})
const emit = defineEmits(['update:modelValue'])

const innerValue = ref(props.modelValue)
watch(() => props.modelValue, v => innerValue.value = v)
watch(innerValue, v => emit('update:modelValue', v))

const computedShortcuts = computed(() => {
  if (props.shortcuts) return props.shortcuts
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0)
  const last7Start = new Date(now.getTime() - 6*24*3600*1000)
  return [
    { text: '最近7天', value: () => [last7Start, now] },
    { text: '本月', value: () => [startOfMonth, endOfMonth] },
    { text: '上个月', value: () => {
      const s = new Date(now.getFullYear(), now.getMonth()-1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0)
      return [s, e]
    }}
  ]
})
</script>