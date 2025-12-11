<template>
  <div :class="`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg p-6 text-white transition hover:scale-105`">
    <div class="flex justify-between items-start mb-3">
      <div class="bg-white bg-opacity-20 p-3 rounded-lg">
        <el-icon :size="24"><component :is="icon" /></el-icon>
      </div>
      <el-icon class="is-loading opacity-50" :size="18"><Refresh /></el-icon>
    </div>
    <h3 class="text-sm opacity-90 mb-1">{{ title }}</h3>
    <p class="text-3xl font-bold">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [Number, String],
  icon: String,
  color: {
    type: String,
    default: 'blue'
  }
})

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600'
}
</script>