<template>
  <div class="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
    <AppHeader v-model:sidebarOpen="sidebarOpen" />
    <div class="flex flex-1 overflow-hidden relative">
      <SideMenu :is-collapse="!sidebarOpen" />
      <main class="flex-1 overflow-y-auto p-6 w-full">
        <router-view v-slot="{ Component }">
          <transition name="el-fade-in-linear" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import SideMenu from './components/SideMenu.vue'

const sidebarOpen = ref(true)
</script>
