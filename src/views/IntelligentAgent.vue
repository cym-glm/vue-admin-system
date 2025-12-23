<template>
  <div class="intelligent-agent-container">
    <h1 class="text-2xl font-bold mb-6">智能体工作流编辑器</h1>
    
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>工作流设计</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="saveWorkflow">
              <el-icon><SaveIcon /></el-icon>
              保存
            </el-button>
            <el-button size="small" @click="loadWorkflow">
              <el-icon><DownloadIcon /></el-icon>
              加载
            </el-button>
            <el-button type="success" size="small" @click="runWorkflow">
              <el-icon><PlayArrowIcon /></el-icon>
              运行
            </el-button>
            <el-button type="warning" size="small" @click="pauseWorkflow">
              <el-icon><PauseCircleIcon /></el-icon>
              暂停
            </el-button>
            <el-button type="info" size="small" @click="resumeWorkflow">
              <el-icon><PlayArrowIcon /></el-icon>
              继续
            </el-button>
            <el-button type="primary" size="small" @click="stepForwardWorkflow">
              <el-icon><StepForwardIcon /></el-icon>
              单步
            </el-button>
            <el-button type="success" size="small" @click="toggleEditMode">
              <el-icon><SwitchButtonIcon /></el-icon>
              {{ agentStore.isEditMode ? '调试' : '设计' }}
            </el-button>
            <el-button type="danger" size="small" @click="clearCanvas">
              <el-icon><DeleteIcon /></el-icon>
              清空
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="workflow-editor">
        <!-- 左侧工具栏 -->
        <div class="toolbar">
          <div class="toolbar-section">
            <h3 class="toolbar-title">基础节点</h3>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'start')">
              <el-icon><CirclePlusIcon /></el-icon>
              <span>开始节点</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'end')">
              <el-icon><CircleCloseIcon /></el-icon>
              <span>结束节点</span>
            </div>
          </div>
          
          <div class="toolbar-section">
            <h3 class="toolbar-title">逻辑节点</h3>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'condition')">
              <el-icon><CircleCheckIcon /></el-icon>
              <span>条件分支</span>
            </div>
          </div>
          
          <div class="toolbar-section">
            <h3 class="toolbar-title">Agent节点</h3>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'agent')">
              <el-icon><ChatDotRoundIcon /></el-icon>
              <span>Agent执行</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'subflow')">
              <el-icon><FolderOpenedIcon /></el-icon>
              <span>子流程</span>
            </div>
          </div>
        </div>
        
        <!-- 中间画布 -->
        <div class="canvas-container">
          <div id="logic-flow-container" ref="canvasRef"></div>
        </div>
        
        <!-- 右侧属性面板 -->
        <div class="properties-panel">
          <div v-if="selectedElement" class="properties-content">
            <h3 class="properties-title">{{ getElementTitle(selectedElement) }}</h3>
            <el-divider />
            
            <el-form :model="elementProperties" label-width="80px" size="small">
              <!-- 动态属性表单，根据节点类型生成 -->
              <el-form-item label="节点名称">
                <el-input v-model="elementProperties.label" placeholder="请输入节点名称" />
              </el-form-item>
              
              <template v-if="selectedElement.type === 'agent'">
                <el-form-item label="Agent类型">
                  <el-select v-model="elementProperties.agentType" placeholder="请选择Agent类型">
                    <el-option label="对话Agent" value="chat" />
                    <el-option label="分析Agent" value="analysis" />
                    <el-option label="执行Agent" value="execution" />
                  </el-select>
                </el-form-item>
                <el-form-item label="Agent配置">
                  <el-input
                    v-model="elementProperties.config"
                    type="textarea"
                    rows="4"
                    placeholder="请输入Agent配置JSON"
                  />
                </el-form-item>
              </template>
              
              <template v-if="selectedElement.type === 'condition'">
                <el-form-item label="条件表达式">
                  <el-input
                    v-model="elementProperties.condition"
                    placeholder="请输入条件表达式，如: $input > 100"
                  />
                </el-form-item>
              </template>
              
              <el-form-item>
                <el-button type="primary" size="small" @click="updateElementProperties">
                  <el-icon><Edit /></el-icon>
                  更新属性
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-else class="properties-empty">
            <el-icon class="empty-icon"><Document /></el-icon>
            <p>请选择一个节点或连线</p>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 调试面板 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>调试面板</span>
          <div class="header-actions">
            <el-button size="small" @click="clearLogs">
              <el-icon><Delete /></el-icon>
              清空日志
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="debug-panel">
        <div class="debug-tabs">
          <el-tabs v-model="activeDebugTab" type="card">
            <el-tab-pane label="执行日志" name="logs">
              <div class="logs-container">
                <div v-for="(log, index) in executionLogs" :key="index" class="log-item">
                  <div class="log-time">{{ log.time }}</div>
                  <div class="log-content" :class="`log-${log.level}`">
                    <el-icon>
                      <CircleCloseFilledIcon v-if="log.level === 'error'" />
                      <WarningFilledIcon v-else-if="log.level === 'warning'" />
                      <InfoFilledIcon v-else />
                    </el-icon>
                    <span>{{ log.message }}</span>
                  </div>
                </div>
                <div v-if="executionLogs.length === 0" class="logs-empty">
                  暂无执行日志
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="变量监控" name="variables">
              <div class="variables-container">
                <el-descriptions :column="1" border>
                  <el-descriptions-item v-for="(value, key) in workflowVariables" :key="key" :label="key">
                    <pre>{{ JSON.stringify(value, null, 2) }}</pre>
                  </el-descriptions-item>
                </el-descriptions>
                <div v-if="Object.keys(workflowVariables).length === 0" class="variables-empty">
                  暂无变量数据
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="执行路径" name="path">
              <div class="path-container">
                <el-tree
                  :data="executionPath"
                  :props="pathTreeProps"
                  :expand-on-click-node="false"
                >
                  <template #default="{ node, data }">
                    <span :class="`path-node path-${data.status}`">
                      <el-icon>
                        <CircleCheckFilledIcon v-if="data.status === 'success'" />
                        <CircleCloseFilledIcon v-else-if="data.status === 'error'" />
                        <CirclePlusFilledIcon v-else />
                      </el-icon>
                      {{ node.label }}
                    </span>
                  </template>
                </el-tree>
              </div>
            </el-tab-pane>
            <el-tab-pane label="断点管理" name="breakpoints">
              <div class="breakpoints-container">
                <div class="breakpoints-header">
                  <span>断点列表</span>
                  <el-button size="small" type="primary" @click="addBreakpoint">
                    <el-icon><BreakpointIcon /></el-icon>
                    添加断点
                  </el-button>
                </div>
                <div class="breakpoints-list">
                  <div v-if="agentStore.workflowData.nodes.length === 0" class="breakpoints-empty">
                    暂无节点，无法添加断点
                  </div>
                  <el-table :data="agentStore.workflowData.nodes" style="width: 100%" size="small">
                    <el-table-column prop="properties.label" label="节点名称" width="180" />
                    <el-table-column prop="type" label="节点类型" width="120" />
                    <el-table-column label="操作" width="100">
                      <template #default="scope">
                        <el-button size="small" type="danger" @click="removeBreakpoint">
                          <el-icon><DeleteIcon /></el-icon>
                          移除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
// 修复图标导入方式 - Element Plus Icons Vue v2.x使用正确的具名导入
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 从命名空间中提取图标组件
const {
  Save: SaveIcon,
  Download: DownloadIcon,
  PlayArrow: PlayArrowIcon,
  Delete: DeleteIcon,
  CirclePlus: CirclePlusIcon,
  CircleClose: CircleCloseIcon,
  CircleCheck: CircleCheckIcon,
  ChatDotRound: ChatDotRoundIcon,
  FolderOpened: FolderOpenedIcon,
  Edit: EditIcon,
  Document: DocumentIcon,
  InfoFilled: InfoFilledIcon,
  WarningFilled: WarningFilledIcon,
  CircleCloseFilled: CircleCloseFilledIcon,
  CircleCheckFilled: CircleCheckFilledIcon,
  CirclePlusFilled: CirclePlusFilledIcon,
  SwitchButton: SwitchButtonIcon,
  PauseCircle: PauseCircleIcon,
  StepForward: StepForwardIcon,
  Breakpoint: BreakpointIcon
} = ElementPlusIconsVue
// 导入Pinia状态管理
import { useAgentStore } from '@/stores/agentStore'
// 导入LogicFlow核心库
import LogicFlow from '@logicflow/core'
// 导入LogicFlow样式
import '@logicflow/core/lib/style/index.css'
// 导入扩展组件样式
import '@logicflow/extension/lib/style/index.css'

// 初始化Pinia状态管理
const agentStore = useAgentStore()

// 画布引用
const canvasRef = ref(null)
const elementProperties = ref({})
const activeDebugTab = ref('logs')
const pathTreeProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const selectedElement = computed(() => {
  return agentStore.selectedNode || agentStore.selectedEdge
})

const executionLogs = computed(() => agentStore.runtimeState.logs)
const workflowVariables = computed(() => agentStore.runtimeState.variables)
const executionPath = computed(() => {
  // 将执行路径转换为树形结构
  return formatExecutionPath(agentStore.runtimeState.executionPath)
})

// 初始化LogicFlow
let lf = null

// 页面挂载后初始化
onMounted(() => {
  initLogicFlow()
})

// 初始化LogicFlow
const initLogicFlow = () => {
  try {
    // 创建LogicFlow实例
    lf = new LogicFlow({
      container: canvasRef.value,
      width: canvasRef.value.clientWidth,
      height: canvasRef.value.clientHeight,
      grid: true,
      background: {
        backgroundImage: 'grid'
      },
      edgeType: 'polyline',
      nodeTextPosition: 'center',
      // 节点配置
      nodeTypes: {
        // 自定义节点类型将在后续实现
      },
      // 连线配置
      edgeTypes: {
        // 自定义连线类型将在后续实现
      }
    })
    
    // 初始化
    lf.render()
    
    // 监听节点选择事件
    lf.on('node:click', (event) => {
      handleElementSelect(event.data.node)
    })
    
    // 监听连线选择事件
    lf.on('edge:click', (event) => {
      handleElementSelect(event.data.edge)
    })
    
    // 监听画布点击事件，取消选择
    lf.on('blank:click', () => {
      agentStore.clearSelection()
      elementProperties.value = {}
    })
    
    // 监听节点添加事件
    lf.on('node:add', (event) => {
      agentStore.addLog('info', `添加节点: ${event.data.node.type}`)
      updateWorkflowData()
    })
    
    // 监听连线添加事件
    lf.on('edge:add', (event) => {
      agentStore.addLog('info', `添加连线: ${event.data.edge.type}`)
      updateWorkflowData()
    })
    
    // 监听节点删除事件
    lf.on('node:delete', (event) => {
      agentStore.addLog('info', `删除节点: ${event.data.node.type}`)
      if (agentStore.selectedNode && agentStore.selectedNode.id === event.data.node.id) {
        agentStore.clearSelection()
        elementProperties.value = {}
      }
      updateWorkflowData()
    })
    
    // 监听连线删除事件
    lf.on('edge:delete', (event) => {
      agentStore.addLog('info', `删除连线: ${event.data.edge.type}`)
      if (agentStore.selectedEdge && agentStore.selectedEdge.id === event.data.edge.id) {
        agentStore.clearSelection()
        elementProperties.value = {}
      }
      updateWorkflowData()
    })
    
    // 实现拖拽放置功能
    canvasRef.value.addEventListener('dragover', handleDragOver)
    canvasRef.value.addEventListener('drop', handleDrop)
    
    agentStore.addLog('success', 'LogicFlow初始化成功')
    console.log('LogicFlow initialized successfully')
  } catch (error) {
    agentStore.addLog('error', `LogicFlow初始化失败: ${error.message}`)
    console.error('Failed to initialize LogicFlow:', error)
  }
}

// 处理拖拽悬停
const handleDragOver = (event) => {
  event.preventDefault()
}

// 处理拖拽放置
const handleDrop = (event) => {
  event.preventDefault()
  
  const nodeType = event.dataTransfer.getData('nodeType')
  if (!nodeType || !lf) return
  
  // 获取鼠标在画布中的位置
  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 将画布坐标转换为LogicFlow坐标
  const position = lf.getPointByClient(x, y)
  
  // 创建节点数据
  const nodeData = {
    type: getNodeType(nodeType),
    x: position.x,
    y: position.y,
    text: getNodeDefaultText(nodeType),
    properties: {
      label: getNodeDefaultText(nodeType)
    }
  }
  
  // 添加节点
  lf.addNode(nodeData)
}

// 根据拖拽类型获取节点类型 - 使用LogicFlow默认节点类型
const getNodeType = (nodeType) => {
  const typeMap = {
    start: 'rect',
    end: 'rect',
    condition: 'diamond',
    agent: 'rect',
    subflow: 'rect'
  }
  return typeMap[nodeType] || 'rect'
}

// 获取节点默认文本
const getNodeDefaultText = (nodeType) => {
  const textMap = {
    start: '开始',
    end: '结束',
    condition: '条件',
    agent: 'Agent',
    subflow: '子流程'
  }
  return textMap[nodeType] || '节点'
}

// 处理元素选择
const handleElementSelect = (element) => {
  if (element.type === 'edge') {
    agentStore.selectEdge(element)
  } else {
    agentStore.selectNode(element)
  }
  
  // 复制元素属性到表单
  elementProperties.value = {
    ...element.properties
  }
}

// 更新工作流数据到状态仓库
const updateWorkflowData = () => {
  if (!lf) return
  const graphData = lf.save()
  agentStore.updateWorkflowData(graphData)
}

// 页面销毁前清理
onBeforeUnmount(() => {
  if (lf) {
    lf.destroy()
  }
  
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('dragover', handleDragOver)
    canvasRef.value.removeEventListener('drop', handleDrop)
  }
})

// 拖拽开始处理
const handleDragStart = (event, nodeType) => {
  event.dataTransfer.setData('nodeType', nodeType)
}

// 获取选中元素标题
const getElementTitle = (element) => {
  if (element.type === 'edge') {
    return '连线属性'
  }
  
  const typeMap = {
    'bpmn:startEvent': '开始节点',
    'bpmn:endEvent': '结束节点',
    'bpmn:exclusiveGateway': '条件分支',
    'bpmn:serviceTask': 'Agent节点',
    'bpmn:subProcess': '子流程节点'
  }
  
  return typeMap[element.type] || '节点属性'
}

// 更新元素属性
const updateElementProperties = () => {
  if (!selectedElement.value || !lf) return
  
  // 更新LogicFlow节点属性
  lf.updateNodeData(selectedElement.value.id, elementProperties.value)
  
  // 更新节点文本
  lf.setNodeText(selectedElement.value.id, elementProperties.value.label)
  
  // 更新状态仓库
  updateWorkflowData()
  
  // 记录日志
  agentStore.addLog('info', `更新节点属性: ${elementProperties.value.label}`)
}

// 保存工作流
const saveWorkflow = () => {
  if (!lf) return
  
  updateWorkflowData()
  const success = agentStore.saveWorkflow()
  if (success) {
    agentStore.addLog('success', '工作流保存成功')
  } else {
    agentStore.addLog('error', '工作流保存失败')
  }
}

// 加载工作流
const loadWorkflow = () => {
  if (!lf) return
  
  const success = agentStore.loadWorkflow()
  if (success) {
    lf.render(agentStore.workflowData)
    agentStore.addLog('success', '工作流加载成功')
  } else {
    agentStore.addLog('warning', '未找到保存的工作流数据')
  }
}

// 运行工作流
const runWorkflow = () => {
  agentStore.addLog('info', '开始运行工作流')
  agentStore.runtimeState.status = 'running'
  
  // 简单的工作流执行模拟
  simulateWorkflowExecution()
}

// 模拟工作流执行
const simulateWorkflowExecution = () => {
  let currentStep = 0
  const nodes = agentStore.workflowData.nodes
  
  // 找到开始节点
  const startNode = nodes.find(node => node.type === 'bpmn:startEvent')
  if (!startNode) {
    agentStore.addLog('error', '未找到开始节点')
    agentStore.runtimeState.status = 'error'
    return
  }
  
  // 执行流程
  const executeNextNode = () => {
    if (currentStep >= nodes.length || agentStore.runtimeState.status === 'paused' || agentStore.runtimeState.status === 'error') {
      return
    }
    
    const node = nodes[currentStep]
    agentStore.addLog('info', `执行节点: ${node.properties.label || node.text}`)
    agentStore.addToExecutionPath(node.id, 'running')
    
    // 模拟节点执行延迟
    setTimeout(() => {
      // 模拟节点执行结果
      const success = Math.random() > 0.1 // 90%成功率
      agentStore.addToExecutionPath(node.id, success ? 'success' : 'error')
      
      if (success) {
        agentStore.addLog('success', `节点执行成功: ${node.properties.label || node.text}`)
        currentStep++
        
        // 如果是结束节点，停止执行
        if (node.type === 'bpmn:endEvent') {
          agentStore.addLog('success', '工作流执行完成')
          agentStore.runtimeState.status = 'completed'
          return
        }
        
        // 继续执行下一个节点
        executeNextNode()
      } else {
        agentStore.addLog('error', `节点执行失败: ${node.properties.label || node.text}`)
        agentStore.runtimeState.status = 'error'
      }
    }, 1000)
  }
  
  executeNextNode()
}

// 暂停工作流
const pauseWorkflow = () => {
  if (agentStore.runtimeState.status === 'running') {
    agentStore.runtimeState.status = 'paused'
    agentStore.addLog('warning', '工作流已暂停')
  }
}

// 继续工作流
const resumeWorkflow = () => {
  if (agentStore.runtimeState.status === 'paused') {
    agentStore.runtimeState.status = 'running'
    agentStore.addLog('info', '工作流继续执行')
    simulateWorkflowExecution()
  }
}

// 单步执行
const stepForwardWorkflow = () => {
  agentStore.addLog('info', '单步执行功能开发中')
}

// 清空画布
const clearCanvas = () => {
  if (!lf) return
  
  lf.clear()
  agentStore.resetWorkflow()
  elementProperties.value = {}
  agentStore.addLog('warning', '画布已清空')
}

// 清空日志
const clearLogs = () => {
  agentStore.resetRuntimeState()
}

// 切换编辑模式
const toggleEditMode = () => {
  agentStore.toggleEditMode()
  agentStore.addLog('info', `切换到${agentStore.isEditMode ? '设计' : '调试'}模式`)
}

// 将执行路径格式化为树形结构
const formatExecutionPath = (path) => {
  // 简单实现，将执行路径转换为树形结构
  const tree = []
  const nodeMap = {}
  
  path.forEach(item => {
    if (!nodeMap[item.nodeId]) {
      nodeMap[item.nodeId] = {
        name: `节点 ${item.nodeId}`,
        id: item.nodeId,
        status: item.status,
        children: []
      }
      tree.push(nodeMap[item.nodeId])
    }
  })
  
  return tree
}

// 添加断点
const addBreakpoint = () => {
  agentStore.addLog('info', '断点功能开发中')
}

// 移除断点
const removeBreakpoint = () => {
  agentStore.addLog('info', '断点功能开发中')
}
</script>

<style scoped>
.intelligent-agent-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.workflow-editor {
  display: flex;
  gap: 16px;
  height: 600px;
}

.toolbar {
  width: 200px;
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 16px;
  overflow-y: auto;
}

.toolbar-section {
  margin-bottom: 24px;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.3s;
}

.node-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-item:active {
  cursor: grabbing;
}

.canvas-container {
  flex: 1;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

#logic-flow-container {
  width: 100%;
  height: 100%;
}

.properties-panel {
  width: 300px;
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 16px;
  overflow-y: auto;
}

.properties-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.properties-content {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
}

.properties-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.debug-panel {
  height: 400px;
}

.debug-tabs {
  height: 100%;
}

.logs-container {
  height: 350px;
  overflow-y: auto;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.log-item.log-error {
  border-left-color: #f56c6c;
}

.log-item.log-warning {
  border-left-color: #e6a23c;
}

.log-time {
  font-size: 12px;
  color: #909399;
  min-width: 100px;
}

.log-content {
  flex: 1;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-content.log-error {
  color: #f56c6c;
}

.log-content.log-warning {
  color: #e6a23c;
}

.logs-empty {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.variables-container {
  height: 350px;
  overflow-y: auto;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
}

.variables-container pre {
  margin: 0;
  font-size: 12px;
  background-color: #f0f2f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

.variables-empty {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.path-container {
  height: 350px;
  overflow-y: auto;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
}

.path-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

.path-success {
  color: #67c23a;
}

.path-error {
  color: #f56c6c;
}

.path-pending {
  color: #409eff;
}

/* 断点管理样式 */
.breakpoints-container {
  height: 350px;
  overflow-y: auto;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
}

.breakpoints-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.breakpoints-list {
  height: calc(100% - 50px);
  overflow-y: auto;
}

.breakpoints-empty {
  text-align: center;
  color: #909399;
  padding: 20px;
}

/* 清空日志按钮修复 */
.el-icon {
  font-size: inherit;
}
</style>