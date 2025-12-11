<template>
  <div class="space-y-4">
    <el-card class="rounded-xl border-none">
      <template #header>
        <div class="flex items-center gap-3">
          <span class="font-bold">table表格封装</span>
          <el-tag type="info">智能分页/高级筛选/列配置/导出/编辑/拖拽/统计/批量</el-tag>
        </div>
      </template>
      <div class="flex flex-wrap gap-3 items-center">
        <el-select v-model="pagination.mode" size="small" style="width:140px">
          <el-option label="前端分页" value="client" />
          <el-option label="后端分页" value="server" />
        </el-select>
        <el-input v-model="search" size="small" placeholder="智能搜索(支持模糊)" style="width:220px" />
        <el-button size="small" @click="advOpen = !advOpen">高级筛选</el-button>
        <el-button size="small" type="warning" @click="resetColumns">重置列配置</el-button>
        <el-button size="small" type="primary" @click="batchSave">批量保存</el-button>
        <el-button size="small" @click="batchExport('xls')">批量导出(xls)</el-button>
        <el-button size="small" @click="batchExport('csv')">批量导出(csv)</el-button>
        <el-tag>已选 {{ selectedCount }} 项</el-tag>
      </div>
      <el-collapse v-model="advActive">
        <el-collapse-item title="筛选面板" name="adv" v-show="advOpen">
          <div class="flex flex-wrap gap-3">
            <el-select v-model="filterCity" clearable placeholder="城市" size="small" style="width:140px">
              <el-option label="北京" value="北京" />
              <el-option label="上海" value="上海" />
              <el-option label="广州" value="广州" />
            </el-select>
            <el-select v-model="filterEnabled" clearable placeholder="启用" size="small" style="width:140px">
              <el-option label="启用" value="true" />
              <el-option label="禁用" value="false" />
            </el-select>
          </div>
        </el-collapse-item>
      </el-collapse>

      <DataTableX
        ref="tableX"
        v-model:rows="rows"
        v-model:columns="columns"
        v-model:pagination="pagination"
        :default-sort="{ prop: 'id', order: 'ascending' }"
        storage-key="table-encap"
        :rows-per-print-page="20"
        print-title="表格打印"
        :print-styles="{ fontSize: '12px', bordered: true }"
        @page-change="onPageChange"
        @size-change="onPageSize"
        @sort-change="onSort"
        @selection-change="onSelection"
      />

      <div class="flex justify-between items-center mt-3">
        <div class="text-sm text-gray-600">合计金额：<span class="font-bold text-blue-600">¥{{ totalAmount.toLocaleString() }}</span></div>
        <div class="flex items-center gap-2">
          <span class="text-sm">每页</span>
          <el-select v-model="pagination.pageSize" size="small" style="width:100px">
            <el-option v-for="s in [10,20,50,100]" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DataTableX from '@/components/encapsulate/DataTableX.vue'

const tableX = ref()
const search = ref('')
const advOpen = ref(false)
const advActive = ref(['adv'])
const filterCity = ref('')
const filterEnabled = ref('')

const pagination = ref({ mode: 'client', pageSize: 10, currentPage: 1, total: 0 })

const defaultColumns = [
  { label: 'ID', prop: 'id', sortable: true, width: 80 },
  { label: '名称', prop: 'name', sortable: true, filterable: true },
  { label: '城市', prop: 'city', filterable: true },
  { label: '启用', prop: 'enabled', filterable: true, formatter: r => (r.enabled ? '启用' : '禁用') },
  { label: '数量', prop: 'qty', editable: true, editorType: 'input', width: 120 },
  { label: '单价', prop: 'price', editable: true, editorType: 'input', width: 120 },
  { label: '金额', prop: 'amount', sortable: true, width: 140 },
  { label: '权限', prop: 'perm' },
  { label: '路径', prop: 'path' },
  { label: '操作', prop: '__action', type: 'action', width: 200 }
]
const columns = ref([...defaultColumns])

const baseRows = ref(Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: ['用户管理','权限管理','数据表格','组件封装'][i % 4] + ' ' + ['User','Permission','Table','Components'][i % 4],
  city: ['北京','上海','广州'][i % 3],
  enabled: Math.random() < 0.7,
  qty: Math.floor(Math.random() * 10) + 1,
  price: Math.floor(Math.random() * 100) + 20,
  amount: 0,
  perm: 'menu:view:' + ['user','permission','table','components'][i % 4],
  path: '/' + ['user','permission','table','components'][i % 4] + '-' + (i + 1)
})))
const rows = ref([])

const applyCompute = (list) => {
  list.forEach(r => r.amount = Number(r.qty) * Number(r.price))
  return list
}

const advancedFilter = computed(() => {
  const term = search.value.trim().toLowerCase()
  return baseRows.value.filter(r => {
    const hitTerm = !term || [r.name, r.path, r.perm].some(v => String(v).toLowerCase().includes(term))
    const hitCity = !filterCity.value || r.city === filterCity.value
    const hitEnabled = !filterEnabled.value || String(r.enabled) === filterEnabled.value
    return hitTerm && hitCity && hitEnabled
  })
})

const selectedCount = ref(0)
const onSelection = (vals) => { selectedCount.value = vals.length }

const refreshClient = () => {
  const list = applyCompute([...advancedFilter.value])
  pagination.value.total = list.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  rows.value = list.slice(start, start + pagination.value.pageSize)
}

const fakeServer = async () => {
  const list = applyCompute([...advancedFilter.value])
  pagination.value.total = list.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  rows.value = list.slice(start, start + pagination.value.pageSize)
}

watch([search, filterCity, filterEnabled], () => {
  pagination.value.currentPage = 1
  pagination.value.mode === 'client' ? refreshClient() : fakeServer()
})

watch([() => pagination.value.pageSize, () => pagination.value.currentPage, () => pagination.value.mode], () => {
  pagination.value.mode === 'client' ? refreshClient() : fakeServer()
}, { immediate: true })

const onPageChange = () => { pagination.value.mode === 'client' ? refreshClient() : fakeServer() }
const onPageSize = () => { pagination.value.currentPage = 1; pagination.value.mode === 'client' ? refreshClient() : fakeServer() }
const onSort = () => { /* 服务器排序示例可在此扩展 */ }

const totalAmount = computed(() => applyCompute([...advancedFilter.value]).reduce((s, r) => s + r.amount, 0))

const resetColumns = () => {
  try { localStorage.removeItem('table-cols:table-encap') } catch {}
  columns.value = [...defaultColumns]
}

const batchSave = () => {
  // 模拟批量保存
}

const toCsv = (list, cols) => {
  const head = cols.map(c => c.label).join(',')
  const body = list.map(r => cols.map(c => JSON.stringify(r[c.prop] ?? '')).join(',')).join('\n')
  return head + '\n' + body
}
const batchExport = (fmt) => {
  const cols = columns.value.filter(c => c.prop && c.prop !== '__action')
  const data = rows.value
  if (fmt === 'csv') {
    const csv = toCsv(data, cols)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${Date.now()}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  } else {
    // 使用 DataTableX 内置 xls 导出更完整样式：为保持一致，这里也可直接调用页面上的导出按钮
    // 简化为当前筛选页导出：调用组件自带导出入口（如需可在组件内暴露方法）
  }
}
</script>
