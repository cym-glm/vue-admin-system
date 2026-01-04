<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <el-dropdown>
        <el-button type="primary" text>列显示</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="col in columns"
              :key="col.prop"
              draggable="true"
              @dragstart="onColDragStart(col)"
              @dragover.prevent
              @drop="onColDrop(col)"
            >
              <el-checkbox v-model="visibleSet[col.prop]">{{ col.label }}</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="flex flex-wrap gap-3">
        <template v-for="col in columns" :key="col.prop">
          <div v-if="col.filterable" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ col.label }}</span>
            <component
              :is="col.filterType === 'select' ? 'el-select' : 'el-input'"
              v-model="filtersState[col.prop]"
              clearable
              size="small"
              class="w-36"
            >
              <el-option v-for="opt in (col.filterOptions || [])" :key="opt.value ?? opt" :label="opt.label ?? opt" :value="opt.value ?? opt" />
            </component>
          </div>
        </template>
      </div>

      <el-button size="small" type="primary" @click="onAddRow">新增行</el-button>
      <el-button size="small" @click="onDeleteSelectedRows" :disabled="selection.length===0">删除所选</el-button>
      <el-button size="small" @click="openExport">导出Excel</el-button>
      <el-button size="small" @click="openPrint">打印预览</el-button>
    </div>

    <el-table
      ref="tableRef"
      :data="displayRows"
      @sort-change="onSortChange"
      :default-sort="defaultSort"
      border
      row-key="__rowKey"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column
        v-for="col in renderColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :sortable="col.sortable ? 'custom' : false"
      >
        <template #header>
          <div class="flex items-center gap-2 select-none" :class="{ 'drag-selected': selectedCols.has(indexHeader(col)) }" @click="onHeaderClick(indexHeader(col), $event)">
            <el-icon class="drag-handle" :size="14"><Rank /></el-icon>
            <span>{{ col.label }}</span>
          </div>
        </template>
        <template #default="{ row, $index }">
          <template v-if="col.type==='action'">
            <el-button size="small" type="primary" @click="row.__editing=true">编辑</el-button>
            <el-button size="small" type="success" class="ml-2" @click="row.__editing=false">保存</el-button>
            <el-button size="small" class="ml-2" @click="row.__editing=false">取消</el-button>
          </template>
          <component
            v-else-if="col.editable && (row.__editing ?? true)"
            :is="resolveEditor(col)"
            v-model="innerRows[globalIndex($index)][col.prop]"
            size="small"
            @change="onCellChange(innerRows[globalIndex($index)], col)"
            v-bind="col.editorProps || {}"
          />
          <span v-else>{{ formatCell(row, col) }}</span>
        </template>
      </el-table-column>
      <template #empty>
        <div class="py-10 text-gray-500">暂无数据</div>
      </template>
    </el-table>

    <div class="flex justify-end">
      <el-pagination
        v-if="pagination"
        background
        layout="prev, pager, next, sizes, total"
        :total="pageTotal"
        :page-sizes="[10,20,50,100]"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <el-dialog v-model="exportDialog" title="导出Excel" width="480px">
      <div class="space-y-3">
        <el-radio-group v-model="exportMode">
          <el-radio-button label="page">导出当前页</el-radio-button>
          <el-radio-button label="all">导出全部数据</el-radio-button>
        </el-radio-group>
        <div>
          <div class="mb-2 text-sm text-gray-600">选择导出字段</div>
          <el-checkbox-group v-model="exportFields">
            <el-checkbox v-for="c in columns" :key="c.prop" :label="c.prop">{{ c.label }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="exportDialog=false">取消</el-button>
        <el-button type="primary" @click="doExport">导出</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="printDialog" :title="printTitle" width="80%">
      <div class="max-h-[60vh] overflow-auto" ref="printPreviewRef">
        <div v-for="(chunk, idx) in printChunks" :key="idx" class="print-page">
          <div v-if="printHeader" class="text-gray-600 mb-2" v-html="printHeader"></div>
          <table class="print-table">
            <thead>
              <tr>
                <th v-for="c in renderColumns" :key="c.prop">{{ c.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in chunk" :key="r.__rowKey">
                <td v-for="c in renderColumns" :key="c.prop">{{ formatCell(r, c) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="printFooter" class="text-gray-600 mt-2" v-html="printFooter"></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="printDialog=false">关闭</el-button>
        <el-button type="primary" @click="doPrint">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref, nextTick } from 'vue'
import Sortable from 'sortablejs'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  pagination: { type: Object, default: null },
  defaultSort: { type: Object, default: () => ({}) },
  rowsPerPrintPage: { type: Number, default: 20 },
  storageKey: { type: String, default: '' },
  printTitle: { type: String, default: '打印预览' },
  printHeader: { type: String, default: '' },
  printFooter: { type: String, default: '' },
  printStyles: { type: Object, default: () => ({ fontSize: '12px', bordered: true }) }
})
const emit = defineEmits(['update:pagination', 'page-change', 'size-change', 'sort-change', 'update:rows', 'update:columns', 'drag-sort'])

const visibleSet = reactive({})
const filtersState = reactive({})
const sortState = ref({ prop: null, order: null })
const selection = ref([])
const tableRef = ref()
const exportDialog = ref(false)
const exportMode = ref('page')
const exportFields = ref([])
const printDialog = ref(false)
const printPreviewRef = ref()
const printChunks = ref([])
let dragColFrom = null
let dragHeadSortable = null
let storedOrderApplied = false

watch(() => props.columns, (cols) => {
  cols.forEach(c => {
    if (!(c.prop in visibleSet)) visibleSet[c.prop] = c.visible !== false
    if (c.filterable && !(c.prop in filtersState)) filtersState[c.prop] = ''
  })
  if (props.storageKey && !storedOrderApplied) {
    try {
      const raw = localStorage.getItem(`table-cols:${props.storageKey}`)
      if (raw) {
        const order = JSON.parse(raw)
        if (Array.isArray(order) && order.length) {
          const current = cols.map(c => c.prop)
          const same = current.length === order.length && current.every((p, i) => p === order[i])
          if (!same) {
            const map = new Map(order.map((p, i) => [p, i]))
            const next = [...cols].sort((a, b) => (map.has(a.prop) ? map.get(a.prop) : 1e9) - (map.has(b.prop) ? map.get(b.prop) : 1e9))
            emit('update:columns', next)
          }
        }
      }
    } catch {}
    storedOrderApplied = true
  }
}, { immediate: true })

const renderColumns = computed(() => props.columns.filter(c => visibleSet[c.prop]))

const isClient = computed(() => props.pagination && (props.pagination.mode || 'client') === 'client')
const pageSize = computed(() => props.pagination ? props.pagination.pageSize || 10 : 10)
const currentPage = computed(() => props.pagination ? props.pagination.currentPage || 1 : 1)

const innerRows = ref([])
watch(() => props.rows, (val) => {
  innerRows.value = (val || []).map((r, idx) => ({ __rowKey: r.__rowKey ?? `${idx}-${Math.random().toString(36).slice(2)}`, ...r }))
}, { immediate: true, deep: true })

const filteredRows = computed(() => {
  let data = innerRows.value
  for (const key in filtersState) {
    const val = filtersState[key]
    if (val !== undefined && val !== null && val !== '') {
      data = data.filter(r => String(r[key]).includes(String(val)))
    }
  }
  if (sortState.value.prop && sortState.value.order) {
    const dir = sortState.value.order === 'ascending' ? 1 : -1
    data = [...data].sort((a,b) => {
      const av = a[sortState.value.prop]
      const bv = b[sortState.value.prop]
      if (av === bv) return 0
      return av > bv ? dir : -dir
    })
  }
  return data
})

const pageTotal = computed(() => isClient.value ? filteredRows.value.length : (props.pagination?.total || innerRows.value.length))
const displayRows = computed(() => {
  if (!props.pagination || !isClient.value) return props.rows
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const onSortChange = ({ prop, order }) => {
  sortState.value = { prop, order }
  if (!isClient.value) emit('sort-change', { prop, order })
}
const onSizeChange = (size) => {
  if (props.pagination) {
    const next = { ...props.pagination, pageSize: size }
    emit('update:pagination', next)
    emit('size-change', size)
  }
}
const onPageChange = (page) => {
  if (props.pagination) {
    const next = { ...props.pagination, currentPage: page }
    emit('update:pagination', next)
    emit('page-change', page)
  }
}

const resolveEditor = (col) => {
  const type = col.editorType || 'input'
  if (type === 'select') return 'el-select'
  if (type === 'switch') return 'el-switch'
  if (type === 'date') return 'el-date-picker'
  return 'el-input'
}
const formatCell = (row, col) => {
  return col.formatter ? col.formatter(row, col, row[col.prop]) : row[col.prop]
}
const onCellChange = (row, col) => {
  if (typeof col.validator === 'function') {
    const ok = col.validator(row[col.prop], row)
    if (!ok) return
  }
  emit('update:rows', innerRows.value.map(r => ({ ...r, __rowKey: undefined })))
}

const onAddRow = () => {
  const newRow = {}
  props.columns.forEach(c => newRow[c.prop] = c.defaultValue ?? null)
  innerRows.value = [{ __rowKey: `${Date.now()}-${Math.random()}`, ...newRow }, ...innerRows.value]
  emit('update:rows', innerRows.value.map(r => ({ ...r, __rowKey: undefined })))
}

const onSelectionChange = (vals) => {
  selection.value = vals
  try { emit('selection-change', vals) } catch {}
}
const onDeleteSelectedRows = () => {
  if (!selection.value.length) return
  const keys = new Set(selection.value.map(r => r.__rowKey))
  innerRows.value = innerRows.value.filter(r => !keys.has(r.__rowKey))
  emit('update:rows', innerRows.value.map(r => ({ ...r, __rowKey: undefined })))
}

const onColDragStart = (col) => { dragColFrom = col }
const onColDrop = (toCol) => {
  if (!dragColFrom || dragColFrom.prop === toCol.prop) return
  const idxFrom = props.columns.findIndex(c => c.prop === dragColFrom.prop)
  const idxTo = props.columns.findIndex(c => c.prop === toCol.prop)
  if (idxFrom < 0 || idxTo < 0) return
  const next = [...props.columns]
  const [moved] = next.splice(idxFrom, 1)
  next.splice(idxTo, 0, moved)
  emit('update:columns', next)
  dragColFrom = null
  if (props.storageKey) {
    try { localStorage.setItem(`table-cols:${props.storageKey}`, JSON.stringify(next.map(c => c.prop))) } catch {}
  }
}

const openExport = () => {
  exportFields.value = renderColumns.value.map(c => c.prop)
  exportMode.value = 'page'
  exportDialog.value = true
}
const buildHtmlTable = (rows, cols) => {
  const head = `<tr>${cols.map(c => `<th style="border:1px solid #ddd;padding:6px;background:#ff0000;color:#ffffff;font-weight:bold;text-align:center">${c.label}</th>`).join('')}</tr>`
  const body = rows.map(r => `<tr>${cols.map(c => `<td style="border:1px solid #ddd;padding:6px">${formatCell(r,c) ?? ''}</td>`).join('')}</tr>`).join('')
  return `<table style="border-collapse:collapse;width:100%">${head}${body}</table>`
}
const doExport = () => {
  const cols = renderColumns.value.filter(c => exportFields.value.includes(c.prop))
  const rows = exportMode.value === 'page' ? displayRows.value : filteredRows.value
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${buildHtmlTable(rows, cols)}</body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `table-export-${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  exportDialog.value = false
}

const openPrint = async () => {
  printDialog.value = true
  await nextTick()
  const rows = filteredRows.value
  const per = props.rowsPerPrintPage
  const chunks = []
  for (let i=0;i<rows.length;i+=per) chunks.push(rows.slice(i, i+per))
  printChunks.value = chunks
}
const doPrint = () => {
  const w = window.open('', '_blank')
  if (!w) return
  const borderCss = props.printStyles?.bordered === false ? 'border: none;' : 'border: 1px solid #ddd;'
  const fontSize = props.printStyles?.fontSize || '12px'
  const style = `
    <style>
      body { font-size: ${fontSize}; }
      .print-title { font-weight: 600; margin: 8px 0; }
      .print-header, .print-footer { color: #666; margin: 4px 0; }
      .print-page { page-break-after: always; margin-bottom: 16px; }
      .print-table { width: 100%; border-collapse: collapse; }
      .print-table th, .print-table td { ${borderCss} padding: 6px; }
      .print-table thead th { background: #f7f7f7; }
    </style>
  `
  const total = printChunks.value.length
  const pages = printChunks.value.map((chunk, i) => {
    const head = `<tr>${renderColumns.value.map(c => `<th>${c.label}</th>`).join('')}</tr>`
    const body = chunk.map(r => `<tr>${renderColumns.value.map(c => `<td>${formatCell(r,c) ?? ''}</td>`).join('')}</tr>`).join('')
    const header = props.printHeader ? props.printHeader.replaceAll('{idx}', String(i+1)).replaceAll('{total}', String(total)) : ''
    const footer = props.printFooter ? props.printFooter.replaceAll('{idx}', String(i+1)).replaceAll('{total}', String(total)) : ''
    return `<div class="print-page">
      ${header ? `<div class='print-header'>${header}</div>` : ''}
      <table class="print-table"><thead>${head}</thead><tbody>${body}</tbody></table>
      ${footer ? `<div class='print-footer'>${footer}</div>` : ''}
    </div>`
  }).join('')
  const title = props.printTitle ? `<div class='print-title'>${props.printTitle}</div>` : ''
  w.document.write(`<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${title}${pages}</body></html>`)
  w.document.close()
  w.focus()
  w.print()
}

const globalIndex = (pageIndex) => {
  if (!props.pagination || !isClient.value) return pageIndex
  const start = (currentPage.value - 1) * pageSize.value
  return start + pageIndex
}

const selectedCols = new Set()
const indexHeader = (col) => renderColumns.value.findIndex(c => c.prop === col.prop)
const onHeaderClick = (idx, ev) => {
  if (ev && (ev.metaKey || ev.ctrlKey || ev.shiftKey)) {
    if (selectedCols.has(idx)) selectedCols.delete(idx)
    else selectedCols.add(idx)
  } else {
    selectedCols.clear()
    selectedCols.add(idx)
  }
}

const initHeaderSortable = async () => {
  try {
    await nextTick()
    const theadRow = tableRef.value?.$el?.querySelector('.el-table__header-wrapper thead tr')
    const bodyWrapper = tableRef.value?.$el?.querySelector('.el-table__body-wrapper')
    if (!theadRow) return
    if (dragHeadSortable) {
      dragHeadSortable.destroy()
      dragHeadSortable = null
    }
    dragHeadSortable = Sortable.create(theadRow, {
      animation: 150,
      handle: '.drag-handle',
      scroll: false,
      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      onMove(evt) {
        const el = evt.related
        Array.from(theadRow.children).forEach(th => th.classList.remove('drag-target'))
        if (el) el.classList.add('drag-target')
      },
      onStart() {
        if (bodyWrapper) bodyWrapper.style.overflow = 'hidden'
      },
      onEnd(evt) {
        if (bodyWrapper) bodyWrapper.style.overflow = ''
      const ths = Array.from(theadRow.querySelectorAll('th'))
      const hasSelection = ths[0]?.querySelector('.el-checkbox') != null
      const offset = hasSelection ? 1 : 0
      const from = evt.oldIndex - offset
      const to = evt.newIndex - offset
      if (from < 0 || to < 0) return
      if (to > props.columns.length) return
      let group = Array.from(selectedCols).sort((a,b)=>a-b)
      if (!group.includes(from)) group = [from]
      let next = [...props.columns]
      const picks = group.map(i => next[i]).filter(Boolean)
      for (let i = group.length - 1; i >= 0; i--) {
        const idx = group[i]
        if (idx >= 0 && idx < next.length) next.splice(idx, 1)
      }
      const insertAt = Math.min(Math.max(to, 0), next.length)
      next.splice(insertAt, 0, ...picks)
      selectedCols.clear()
      emit('update:columns', next)
      if (props.storageKey) {
        try { localStorage.setItem(`table-cols:${props.storageKey}`, JSON.stringify(next.map(c => c.prop))) } catch {}
      }
      Array.from(theadRow.children).forEach(th => th.classList.remove('drag-target'))
      }
    })
  } catch {}
}

watch(renderColumns, () => initHeaderSortable(), { immediate: true })

// 行拖拽：在渲染后为每行绑定原生拖拽事件
watch(displayRows, async () => {
  await nextTick()
  const tbody = tableRef.value?.$el?.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return
  Array.from(tbody.querySelectorAll('tr')).forEach((tr, idx) => {
    tr.draggable = true
    tr.ondragstart = (e) => { e.dataTransfer.setData('text/plain', String(idx)) }
    tr.ondragover = (e) => e.preventDefault()
    tr.ondrop = (e) => {
      try {
        const from = Number(e.dataTransfer.getData('text/plain'))
        const to = idx
        if (Number.isNaN(from) || Number.isNaN(to)) return
        const giFrom = globalIndex(from)
        const giTo = globalIndex(to)
        if (giFrom < 0 || giFrom >= innerRows.value.length) return
        const next = [...innerRows.value]
        const [moved] = next.splice(giFrom, 1)
        const insertAt = Math.min(Math.max(giTo, 0), next.length)
        next.splice(insertAt, 0, moved)
        innerRows.value = next
        emit('update:rows', innerRows.value.map(r => ({ ...r, __rowKey: undefined })))
        emit('drag-sort', { from: giFrom, to: insertAt })
      } catch {}
    }
  })
}, { immediate: true })
</script>
<style scoped>
.drag-ghost { opacity: 0.5; }
.drag-chosen { opacity: 0.9; }
.drag-target { box-shadow: inset 2px 0 0 #409EFF; }
.drag-selected { background: rgba(64,158,255,0.08); border-radius: 4px; }
</style>
defineExpose({
  toggleAll: () => tableRef.value?.toggleAllSelection?.(),
  clearSelection: () => tableRef.value?.clearSelection?.(),
  getSelection: () => selection.value
})
