import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAgentStore = defineStore('agent', () => {
  // 工作流数据
  const workflowData = ref({
    nodes: [],
    edges: [],
    properties: {}
  })
  
  // 当前选中的节点
  const selectedNode = ref(null)
  
  // 当前选中的连线
  const selectedEdge = ref(null)
  
  // 编辑模式（true: 设计模式, false: 调试模式）
  const isEditMode = ref(true)
  
  // 运行时状态
  const runtimeState = ref({
    currentNodeId: null,
    executionPath: [],
    variables: {},
    logs: [],
    status: 'idle' // idle, running, paused, completed, error
  })
  
  // Agent能力列表
  const agentCapabilities = ref([
    {
      id: 'chat-agent',
      name: '对话Agent',
      description: '用于处理自然语言对话的智能体',
      schema: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            title: '模型名称',
            default: 'gpt-3.5-turbo'
          },
          temperature: {
            type: 'number',
            title: '温度参数',
            default: 0.7,
            minimum: 0,
            maximum: 1
          },
          systemPrompt: {
            type: 'string',
            title: '系统提示词',
            default: '你是一个有用的AI助手。'
          }
        }
      }
    },
    {
      id: 'analysis-agent',
      name: '分析Agent',
      description: '用于数据分析和处理的智能体',
      schema: {
        type: 'object',
        properties: {
          analysisType: {
            type: 'string',
            title: '分析类型',
            enum: ['data', 'text', 'image'],
            default: 'data'
          },
          outputFormat: {
            type: 'string',
            title: '输出格式',
            enum: ['json', 'text', 'chart'],
            default: 'json'
          }
        }
      }
    },
    {
      id: 'execution-agent',
      name: '执行Agent',
      description: '用于执行特定任务的智能体',
      schema: {
        type: 'object',
        properties: {
          taskType: {
            type: 'string',
            title: '任务类型',
            enum: ['file', 'api', 'code'],
            default: 'api'
          },
          timeout: {
            type: 'number',
            title: '超时时间（秒）',
            default: 30,
            minimum: 5,
            maximum: 300
          }
        }
      }
    }
  ])
  
  // 子流程列表
  const subflows = ref([])
  
  // 获取当前工作流的节点数量
  const nodeCount = computed(() => workflowData.value.nodes.length)
  
  // 获取当前工作流的连线数量
  const edgeCount = computed(() => workflowData.value.edges.length)
  
  // 保存工作流到本地存储
  const saveWorkflow = () => {
    try {
      localStorage.setItem('agentWorkflow', JSON.stringify(workflowData.value))
      return true
    } catch (error) {
      console.error('保存工作流失败:', error)
      return false
    }
  }
  
  // 从本地存储加载工作流
  const loadWorkflow = () => {
    try {
      const savedData = localStorage.getItem('agentWorkflow')
      if (savedData) {
        workflowData.value = JSON.parse(savedData)
        return true
      }
      return false
    } catch (error) {
      console.error('加载工作流失败:', error)
      return false
    }
  }
  
  // 重置工作流
  const resetWorkflow = () => {
    workflowData.value = {
      nodes: [],
      edges: [],
      properties: {}
    }
    selectedNode.value = null
    selectedEdge.value = null
    resetRuntimeState()
  }
  
  // 更新工作流数据
  const updateWorkflowData = (data) => {
    workflowData.value = { ...workflowData.value, ...data }
  }
  
  // 选择节点
  const selectNode = (node) => {
    selectedNode.value = node
    selectedEdge.value = null
  }
  
  // 选择连线
  const selectEdge = (edge) => {
    selectedEdge.value = edge
    selectedNode.value = null
  }
  
  // 取消选择
  const clearSelection = () => {
    selectedNode.value = null
    selectedEdge.value = null
  }
  
  // 切换编辑模式
  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value
    if (!isEditMode.value) {
      // 进入调试模式前重置运行时状态
      resetRuntimeState()
    }
  }
  
  // 重置运行时状态
  const resetRuntimeState = () => {
    runtimeState.value = {
      currentNodeId: null,
      executionPath: [],
      variables: {},
      logs: [],
      status: 'idle'
    }
  }
  
  // 添加执行日志
  const addLog = (level, message) => {
    const log = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      level,
      message
    }
    runtimeState.value.logs.push(log)
    
    // 保持日志数量不超过100条
    if (runtimeState.value.logs.length > 100) {
      runtimeState.value.logs.shift()
    }
  }
  
  // 更新运行时变量
  const updateVariable = (key, value) => {
    runtimeState.value.variables[key] = value
  }
  
  // 添加到执行路径
  const addToExecutionPath = (nodeId, status) => {
    runtimeState.value.executionPath.push({
      nodeId,
      status,
      timestamp: new Date().toLocaleTimeString()
    })
  }
  
  // 注册新的Agent能力
  const registerAgentCapability = (capability) => {
    const existingIndex = agentCapabilities.value.findIndex(cap => cap.id === capability.id)
    if (existingIndex >= 0) {
      agentCapabilities.value[existingIndex] = capability
    } else {
      agentCapabilities.value.push(capability)
    }
  }
  
  // 创建子流程
  const createSubflow = (name) => {
    const subflow = {
      id: `subflow-${Date.now()}`,
      name,
      nodes: [],
      edges: [],
      properties: {}
    }
    subflows.value.push(subflow)
    return subflow
  }
  
  // 保存子流程
  const saveSubflow = (subflowId, data) => {
    const index = subflows.value.findIndex(sf => sf.id === subflowId)
    if (index >= 0) {
      subflows.value[index] = { ...subflows.value[index], ...data }
      return true
    }
    return false
  }
  
  // 删除子流程
  const deleteSubflow = (subflowId) => {
    const index = subflows.value.findIndex(sf => sf.id === subflowId)
    if (index >= 0) {
      subflows.value.splice(index, 1)
      return true
    }
    return false
  }
  
  return {
    workflowData,
    selectedNode,
    selectedEdge,
    isEditMode,
    runtimeState,
    agentCapabilities,
    subflows,
    nodeCount,
    edgeCount,
    saveWorkflow,
    loadWorkflow,
    resetWorkflow,
    updateWorkflowData,
    selectNode,
    selectEdge,
    clearSelection,
    toggleEditMode,
    resetRuntimeState,
    addLog,
    updateVariable,
    addToExecutionPath,
    registerAgentCapability,
    createSubflow,
    saveSubflow,
    deleteSubflow
  }
})