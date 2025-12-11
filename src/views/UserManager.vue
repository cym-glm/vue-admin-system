<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">用户管理</h2>
      <el-button 
        type="primary" 
        icon="Plus" 
        @click="dialogVisible = true"
        v-if="userStore.hasPermission('user.create')"
      >
        新增用户
      </el-button>
    </div>

    <div class="bg-white p-10 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-500">
      <el-icon :size="60" class="mb-4 text-gray-300"><UserFilled /></el-icon>
      <p>这里是用户管理列表区域，可以复用 DataTable 组件或开发新的卡片视图。</p>
    </div>

    <el-dialog v-model="dialogVisible" title="创建新用户" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱">
            <template #suffix>
              <el-icon v-if="checkingEmail" class="is-loading"><Loading /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" class="w-full">
            <el-option label="普通用户" value="user" />
            <el-option label="经理" value="manager" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入所属部门" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm(formRef)">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const dialogVisible = ref(false)
const formRef = ref(null)
const checkingEmail = ref(false)

const formData = reactive({
  name: '',
  email: '',
  role: 'user',
  department: ''
})

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) return callback(new Error('邮箱不能为空'))
  if (!emailRegex.test(value)) return callback(new Error('邮箱格式不正确'))
  
  checkingEmail.value = true
  setTimeout(() => {
    checkingEmail.value = false
    if (value === 'test@example.com') {
      callback(new Error('该邮箱已被注册'))
    } else {
      callback()
    }
  }, 800)
}

const rules = reactive({
  name: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, message: '至少2个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  department: [
    { required: true, message: '部门不能为空', trigger: 'blur' }
  ]
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      ElMessage.success('用户创建成功！')
      console.log(formData)
      dialogVisible.value = false
      formEl.resetFields()
    }
  })
}
</script>
