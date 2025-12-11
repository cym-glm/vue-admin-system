<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">数据仪表盘</h2>
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="handleExport"
        :disabled="!userStore.hasPermission('chart.export')"
      >
        <el-icon class="mr-1"><Download /></el-icon> 导出报表
      </el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard v-memo="[realtimeData.users]" title="在线用户" :value="realtimeData.users" color="blue" icon="User" />
      <StatCard v-memo="[realtimeData.orders]" title="今日订单" :value="realtimeData.orders" color="green" icon="ShoppingCart" />
      <StatCard v-memo="[realtimeData.revenue]" title="总收入" :value="`¥${realtimeData.revenue.toLocaleString()}`" color="purple" icon="Money" />
    </div>

    <el-card class="rounded-xl shadow-sm border-none">
      <template #header>
        <div class="font-bold">月度销售趋势</div>
      </template>
      <div class="space-y-4">
        <div v-for="(item, index) in chartData" :key="index" class="flex items-center gap-4">
          <span class="w-12 text-sm font-medium text-gray-600">{{ item.month }}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-1000 ease-out"
              :style="{ width: `${(item.value / maxValue) * 100}%` }"
            >
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <el-card class="rounded-xl shadow-sm border-none">
      <template #header>
        <div class="font-bold">营销海报（懒加载与Blur-up）</div>
      </template>
      <LazyImage
        src="https://picsum.photos/id/1015/900/400"
        placeholder="https://picsum.photos/id/1015/45/20?blur=10"
        alt="Promo"
        srcset="https://picsum.photos/id/1015/600/267 600w, https://picsum.photos/id/1015/900/400 900w"
        sizes="(max-width: 768px) 600px, 900px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'
const StatCard = defineAsyncComponent({
  loader: () => import('@/components/StatCard.vue'),
  delay: 200,
  timeout: 3000,
  onError: (err, retry, fail, attempts) => {
    if (attempts <= 2) retry()
    else fail()
  }
})
import LazyImage from '@/components/LazyImage.vue'

const userStore = useUserStore()
const loading = ref(false)

const chartData = ref([
  { month: '1月', value: 820 },
  { month: '2月', value: 932 },
  { month: '3月', value: 901 },
  { month: '4月', value: 934 },
  { month: '5月', value: 1290 },
  { month: '6月', value: 1330 }
])
const maxValue = computed(() => Math.max(...chartData.value.map(d => d.value)))

const realtimeData = ref({ users: 1234, orders: 567, revenue: 89012 })
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    realtimeData.value.users += Math.floor(Math.random() * 10 - 5)
    realtimeData.value.orders += Math.floor(Math.random() * 5 - 2)
    realtimeData.value.revenue += Math.floor(Math.random() * 1000 - 500)
  }, 3000)
})

onUnmounted(() => clearInterval(timer))

const handleExport = async () => {
  if (!userStore.hasPermission('chart.export')) {
    ElMessage.warning('您没有导出权限')
    return
  }
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  ElMessage.success('图表数据已导出')
  loading.value = false
}
</script>
