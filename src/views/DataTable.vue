<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800">数据表格管理</h2>
    
    <el-card shadow="hover" class="border-none">
      <div class="flex flex-wrap gap-4">
        <el-input 
          v-model="searchText" 
          placeholder="搜索用户名或邮箱..." 
          prefix-icon="Search"
          class="w-64"
          clearable
        />
        <el-select v-model="filterRole" placeholder="角色筛选" class="w-40">
          <el-option label="全部角色" value="all" />
          <el-option label="管理员" value="admin" />
          <el-option label="经理" value="manager" />
          <el-option label="普通用户" value="user" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态筛选" class="w-40">
          <el-option label="全部状态" value="all" />
          <el-option label="激活" value="active" />
          <el-option label="未激活" value="inactive" />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="hover" class="border-none">
      <el-table 
        :data="filteredData" 
        row-key="id" 
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="姓名" sortable />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" effect="plain">
              {{ row.status === 'active' ? '激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button link type="primary" icon="View">查看</el-button>
            <el-button link type="success" icon="Edit" v-if="userStore.hasPermission('user.edit')">编辑</el-button>
            <el-button link type="danger" icon="Delete" v-if="userStore.hasPermission('user.delete')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const searchText = ref('')
const filterRole = ref('all')
const filterStatus = ref('all')

const mockUsers = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active', department: '技术部', createTime: '2024-01-15', children: [
    { id: 11, name: '李四', email: 'lisi@example.com', role: 'user', status: 'active', department: '技术部', createTime: '2024-02-10' },
    { id: 12, name: '王五', email: 'wangwu@example.com', role: 'user', status: 'inactive', department: '技术部', createTime: '2024-02-15' }
  ]},
  { id: 2, name: '赵六', email: 'zhaoliu@example.com', role: 'manager', status: 'active', department: '市场部', createTime: '2024-01-20', children: [
    { id: 21, name: '孙七', email: 'sunqi@example.com', role: 'user', status: 'active', department: '市场部', createTime: '2024-03-01' }
  ]},
  { id: 3, name: '周八', email: 'zhouba@example.com', role: 'user', status: 'active', department: '产品部', createTime: '2024-02-01' },
  { id: 5, name: '郑十', email: 'zhengshi@example.com', role: 'manager', status: 'active', department: '财务部', createTime: '2024-01-10' }
]

const filteredData = computed(() => {
  return mockUsers.filter(item => {
    const matchText = !searchText.value || item.name.includes(searchText.value) || item.email.includes(searchText.value)
    const matchRole = filterRole.value === 'all' || item.role === filterRole.value
    const matchStatus = filterStatus.value === 'all' || item.status === filterStatus.value
    return matchText && matchRole && matchStatus
  })
})

const getRoleType = (role) => {
  const map = { admin: 'danger', manager: 'warning', user: 'info' }
  return map[role] || 'info'
}
</script>
