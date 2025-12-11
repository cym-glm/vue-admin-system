<template>
  <el-aside :width="isCollapse ? '64px' : '240px'" class="bg-white shadow-lg transition-all duration-300 h-full flex flex-col">
  <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        class="border-none h-full"
        :collapse="isCollapse"
        router
      >
        <el-menu-item
          v-for="item in visibleMenus"
          :key="item.path"
          :index="item.path"
        >
          <el-icon>
            <component :is="item.icon || 'Menu'" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
  </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const props = defineProps(['isCollapse'])
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const visibleMenus = computed(() => userStore.menus)
</script>
