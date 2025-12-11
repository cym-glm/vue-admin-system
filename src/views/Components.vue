<template>
  <div class="space-y-6">
    <el-card class="rounded-xl border-none">
      <template #header>
        <div class="font-bold">组件封装</div>
      </template>
      <el-tabs v-model="active">
        <el-tab-pane label="表格封装" name="table">
          <div class="space-y-4">
            <DataTableX
              v-model:rows="tableRows"
              v-model:columns="tableCols"
              v-model:pagination="tablePage"
              :default-sort="{ prop: 'age', order: 'ascending' }"
              :rows-per-print-page="10"
              storage-key="components-menu-table"
              print-title="菜单清单打印"
              :print-header="'<div>公司内部文档</div>'"
              :print-footer="'<div>第 {idx} 页</div>'"
              :print-styles="{ fontSize: '12px', bordered: true }"
            />
            <el-divider />
            <div class="space-y-2">
              <div class="text-lg font-bold">API文档</div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="props.rows">数据数组</el-descriptions-item>
                <el-descriptions-item label="props.columns">列配置数组，支持label、prop、sortable、filterable、filterType、filterOptions、visible、width、formatter</el-descriptions-item>
                <el-descriptions-item label="props.pagination">分页对象{mode,pageSize,currentPage,total}</el-descriptions-item>
                <el-descriptions-item label="props.rowsPerPrintPage">打印分页行数，默认20</el-descriptions-item>
                <el-descriptions-item label="列编辑">在列上设置editable/editorType/validator/editorProps/defaultValue</el-descriptions-item>
                <el-descriptions-item label="v-model">支持 v-model:rows 与 v-model:columns</el-descriptions-item>
                <el-descriptions-item label="事件">page-change、size-change、sort-change、drag-sort、update:rows、update:columns</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="表单封装" name="form">
          <div class="space-y-4">
            <DynamicFormX v-model="formState" :schema="formSchema" :rules="formRules" @submit="onSubmit" />
            <el-divider />
            <div class="space-y-2">
              <div class="text-lg font-bold">API文档</div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="v-model">表单数据对象</el-descriptions-item>
                <el-descriptions-item label="props.schema">JSON驱动字段数组，支持type、label、model、props、options、span</el-descriptions-item>
                <el-descriptions-item label="props.rules">校验规则对象</el-descriptions-item>
                <el-descriptions-item label="expose">validate、resetFields、getValues</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="日期封装" name="date">
          <div class="space-y-4">
            <RangeDatePickerX v-model="dateRange" />
            <el-divider />
            <div class="space-y-2">
              <div class="text-lg font-bold">API文档</div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="v-model">日期或范围值</el-descriptions-item>
                <el-descriptions-item label="props.type">选择类型，默认daterange</el-descriptions-item>
                <el-descriptions-item label="props.shortcuts">快捷选项数组</el-descriptions-item>
                <el-descriptions-item label="props.format/valueFormat">显示与值格式</el-descriptions-item>
                <el-descriptions-item label="props.disabledDate">禁用日期函数</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DataTableX from '@/components/encapsulate/DataTableX.vue'
import DynamicFormX from '@/components/encapsulate/DynamicFormX.vue'
import RangeDatePickerX from '@/components/encapsulate/RangeDatePickerX.vue'
import { ElMessage } from 'element-plus'

const active = ref('table')

const cnNames = ['用户管理','权限管理','数据仪表盘','数据表格','组件封装','系统设置','日志审计','消息通知','文件中心','报表中心','项目管理','角色管理','菜单管理','字典管理','开发工具','监控中心','任务调度','配置中心','工作台','帮助中心']
const enNames = ['User','Permission','Dashboard','Table','Components','Settings','Audit','Notification','Files','Reports','Project','Role','Menu','Dict','DevTools','Monitor','Scheduler','Config','Workspace','Help']
const icons = ['UserOutlined','SettingOutlined','DashboardOutlined','TableOutlined','LockOutlined','BellOutlined','FileOutlined','BarChartOutlined','AppstoreOutlined','DatabaseOutlined','ToolOutlined','ProfileOutlined','CalendarOutlined','CloudOutlined','FolderOpenOutlined','ExperimentOutlined','PlusSquareOutlined','MailOutlined','MenuOutlined','TeamOutlined']

const kebab = (s) => s.replace(/([a-z])([A-Z])/g,'$1-$2').replace(/\s+/g,'-').toLowerCase()

const genMenus = () => {
  const list = []
  for (let i = 0; i < 20; i++) {
    const cn = cnNames[i % cnNames.length]
    const en = enNames[i % enNames.length]
    const name = `${cn} ${en}`
    const icon = icons[i % icons.length]
    const enabled = Math.random() < 0.7
    const order = Math.floor(Math.random() * 100) + 1
    const path = `/${kebab(en)}-${i+1}`
    const perm = `menu:view:${kebab(en)}`
    const created = new Date(Date.now() - Math.floor(Math.random()*30)*24*3600*1000)
    const updated = new Date(created.getTime() + Math.floor(Math.random()*5)*24*3600*1000)
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
    list.push({ id: i+1, name, icon, enabled, order, path, perm, createdAt: fmt(created), updatedAt: fmt(updated) })
  }
  return list
}

const tableRows = ref(genMenus())
const tableCols = ref([
  { label: '菜单ID', prop: 'id', sortable: true, filterable: true, filterType: 'text', width: 90, editable: true, editorType: 'input', validator: (v) => Number(v) >= 1 },
  { label: '菜单名称', prop: 'name', filterable: true, filterType: 'text', sortable: true, width: 220, editable: true },
  { label: '菜单图标', prop: 'icon', filterable: true, filterType: 'text', width: 160, editable: true },
  { label: '是否启用', prop: 'enabled', filterable: true, filterType: 'select', filterOptions: [true, false], sortable: true, width: 120, formatter: (row) => (row.enabled ? '启用' : '禁用'), editable: true, editorType: 'switch' },
  { label: '显示顺序', prop: 'order', sortable: true, filterable: true, filterType: 'text', width: 120, editable: true },
  { label: '路由路径', prop: 'path', filterable: true, filterType: 'text', width: 200, editable: true },
  { label: '权限标识', prop: 'perm', filterable: true, filterType: 'text', width: 220, editable: true },
  { label: '创建时间', prop: 'createdAt', sortable: true, filterable: true, filterType: 'text', width: 180 },
  { label: '更新时间', prop: 'updatedAt', sortable: true, filterable: true, filterType: 'text', width: 180 }
])
const tablePage = ref({ mode: 'client', pageSize: 10, currentPage: 1, total: tableRows.value.length })

const formState = ref({})
const formSchema = ref([
  { type: 'input', label: '姓名', model: 'name', props: { placeholder: '请输入' }, span: 12 },
  { type: 'select', label: '城市', model: 'city', options: ['北京','上海','广州'], span: 12 },
  { type: 'switch', label: '启用', model: 'enabled', span: 12 },
  { type: 'date', label: '日期', model: 'date', props: { type: 'date' }, span: 12 },
  { type: 'textarea', label: '备注', model: 'note', props: { type: 'textarea' }, span: 24 }
])
const formRules = ref({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }]
})
const onSubmit = (val) => ElMessage.success('提交成功')

const dateRange = ref(null)
</script>