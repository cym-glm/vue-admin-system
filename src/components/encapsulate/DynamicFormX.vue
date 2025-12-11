<template>
  <el-form ref="formRef" :model="formState" :rules="rules" :label-width="labelWidth">
    <el-row :gutter="16">
      <el-col v-for="item in schema" :key="item.model" :span="item.span || 24">
        <el-form-item :label="item.label" :prop="item.model">
          <component
            :is="resolveComp(item)"
            v-model="formState[item.model]"
            v-bind="item.props || {}"
          >
            <template v-if="item.type==='select'" #default>
              <el-option v-for="opt in (item.options||[])" :key="opt.value ?? opt" :label="opt.label ?? opt" :value="opt.value ?? opt" />
            </template>
            <template v-if="item.type==='radio'" #default>
              <el-radio v-for="opt in (item.options||[])" :key="opt.value ?? opt" :label="opt.value ?? opt">{{ opt.label ?? opt }}</el-radio>
            </template>
            <template v-if="item.type==='checkbox'" #default>
              <el-checkbox-group>
                <el-checkbox v-for="opt in (item.options||[])" :key="opt.value ?? opt" :label="opt.value ?? opt">{{ opt.label ?? opt }}</el-checkbox>
              </el-checkbox-group>
            </template>
          </component>
        </el-form-item>
      </el-col>
    </el-row>
    <div class="flex justify-end gap-3">
      <el-button @click="resetFields">重置</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'

const props = defineProps({
  schema: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  rules: { type: Object, default: () => ({}) },
  labelWidth: { type: String, default: '100px' }
})
const emit = defineEmits(['update:modelValue', 'submit'])

const formState = reactive({})
const formRef = ref()

const resolveComp = (item) => {
  if (item.component) return item.component
  switch (item.type) {
    case 'input': return 'el-input'
    case 'textarea': return 'el-input'
    case 'select': return 'el-select'
    case 'radio': return 'div'
    case 'checkbox': return 'div'
    case 'switch': return 'el-switch'
    case 'date': return 'el-date-picker'
    case 'daterange': return 'el-date-picker'
    default: return 'el-input'
  }
}

watch(() => props.modelValue, (val) => {
  Object.assign(formState, val || {})
}, { immediate: true, deep: true })

watch(formState, (val) => emit('update:modelValue', { ...val }), { deep: true })

const resetFields = () => {
  Object.keys(formState).forEach(k => formState[k] = undefined)
}
const submit = () => {
  if (!formRef.value) return
  formRef.value.validate((ok) => {
    if (ok) emit('submit', { ...formState })
  })
}

defineExpose({ validate: () => formRef.value?.validate(), resetFields, getValues: () => ({ ...formState }) })
</script>