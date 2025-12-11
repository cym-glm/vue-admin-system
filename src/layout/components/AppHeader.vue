<template>
  <header class="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg h-16 flex items-center justify-between px-6 flex-shrink-0">
    <div class="flex items-center gap-4">
      <el-button link @click="toggleSidebar" class="!text-white text-2xl">
        <el-icon :size="24">
          <component :is="sidebarOpen ? 'Fold' : 'Expand'" />
        </el-icon>
      </el-button>
      <h1 class="text-xl font-bold">Vue3后台管理系统</h1>
    </div>
    
    <div class="flex items-center gap-4">
      <el-badge :value="3" class="item cursor-pointer">
        <el-icon :size="20"><Bell /></el-icon>
      </el-badge>
      
      <el-dropdown trigger="click">
        <div class="flex items-center gap-2 cursor-pointer text-white outline-none">
          <el-avatar :size="32" class="bg-blue-500">{{ userStore.currentUser.name[0] }}</el-avatar>
          <span class="font-medium">{{ userStore.currentUser.name }}</span>
          <el-tag size="small" effect="dark" type="warning">{{ userStore.currentUser.role }}</el-tag>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="userStore.switchRole('admin')">切换为 Admin</el-dropdown-item>
            <el-dropdown-item @click="userStore.switchRole('manager')">切换为 Manager</el-dropdown-item>
            <el-dropdown-item @click="userStore.switchRole('user')">切换为 User</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'

const props = defineProps(['sidebarOpen'])
const emit = defineEmits(['update:sidebarOpen'])
const userStore = useUserStore()

const toggleSidebar = () => {
  emit('update:sidebarOpen', !props.sidebarOpen)
}
</script>
