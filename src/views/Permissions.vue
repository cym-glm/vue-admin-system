<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800">权限管理系统</h2>

    <el-card class="border-none shadow-sm">
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">选择角色模拟预览</label>
        <el-radio-group v-model="previewRole" size="large">
          <el-radio-button label="admin">管理员</el-radio-button>
          <el-radio-button label="manager">经理</el-radio-button>
          <el-radio-button label="user">普通用户</el-radio-button>
        </el-radio-group>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">权限配置详情</h3>
        <div class="space-y-4">
          <div v-for="module in ['用户管理', '数据分析']" :key="module" class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-700 mb-3">{{ module }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div 
                v-for="perm in permissionsList.filter(p => p.module === module)" 
                :key="perm.id"
                :class="`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  hasPerm(perm.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`"
              >
                <el-icon v-if="hasPerm(perm.id)" class="text-blue-600"><CircleCheckFilled /></el-icon>
                <el-icon v-else class="text-gray-400"><CircleCheck /></el-icon>
                <span :class="`text-sm font-medium ${hasPerm(perm.id) ? 'text-blue-700' : 'text-gray-700'}`">
                  {{ perm.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-medium text-blue-900 mb-2">当前角色权限代码 (JSON)</h4>
        <code class="text-xs text-blue-800 block break-words">
          {{ userStore.ROLE_PERMISSIONS[previewRole] }}
        </code>
      </div>
    </el-card>

    <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
        <el-icon><InfoFilled /></el-icon>
        基于角色的访问控制 (RBAC) 说明
      </h3>
      <ul class="space-y-2 text-sm text-gray-700 list-disc pl-5">
        <li><strong>管理员 (Admin):</strong> 拥有系统所有权限，包括用户的增删改查和数据导出。</li>
        <li><strong>经理 (Manager):</strong> 可以查看和编辑用户，查看和导出数据图表。</li>
        <li><strong>普通用户 (User):</strong> 只能查看用户列表和数据图表。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const previewRole = ref('admin')

const permissionsList = [
  { id: 'user.view', name: '查看用户', module: '用户管理' },
  { id: 'user.create', name: '创建用户', module: '用户管理' },
  { id: 'user.edit', name: '编辑用户', module: '用户管理' },
  { id: 'user.delete', name: '删除用户', module: '用户管理' },
  { id: 'chart.view', name: '查看图表', module: '数据分析' },
  { id: 'chart.export', name: '导出图表', module: '数据分析' }
]

const hasPerm = (permId) => {
  return userStore.ROLE_PERMISSIONS[previewRole.value]?.includes(permId)
}
</script>
