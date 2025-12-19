<template>
  <div class="export-file-container">
    <h1 class="text-2xl font-bold mb-6">文件导出</h1>
    
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>导出设置</span>
        </div>
      </template>
      
      <div class="export-setup">
        <el-form :model="exportForm" label-width="120px">
          <el-form-item label="数据来源">
            <el-radio-group v-model="exportForm.dataSource" class="mb-4">
              <el-radio label="sample">使用示例数据</el-radio>
              <el-radio label="current">使用当前页面数据</el-radio>
            </el-radio-group>
            
            <!-- 示例数据设置 -->
            <div v-if="exportForm.dataSource === 'sample'" class="sample-data-setting">
              <el-form-item label="数据行数" prop="sampleRows">
                <el-input-number
                  v-model="exportForm.sampleRows"
                  :min="100"
                  :max="100000"
                  :step="1000"
                  style="width: 200px"
                />
              </el-form-item>
              
              <el-form-item label="数据列数" prop="sampleCols">
                <el-input-number
                  v-model="exportForm.sampleCols"
                  :min="5"
                  :max="50"
                  :step="5"
                  style="width: 200px"
                />
              </el-form-item>
            </div>
          </el-form-item>
          
          <el-form-item label="导出格式">
            <el-select v-model="exportForm.fileFormat" placeholder="请选择文件格式">
              <el-option label="Excel 2007 (.xlsx)" value="xlsx" />
              <el-option label="Excel 97-2003 (.xls)" value="xls" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="工作表名称">
            <el-input v-model="exportForm.sheetName" placeholder="请输入工作表名称" />
          </el-form-item>
          
          <el-form-item label="包含表头">
            <el-switch v-model="exportForm.includeHeader" />
          </el-form-item>
          
          <el-form-item label="日期格式">
            <el-input v-model="exportForm.dateFormat" placeholder="例如：yyyy-mm-dd HH:MM:SS" />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="isExporting"
              @click="handleExport"
            >
              开始导出
            </el-button>
            <el-button
              type="danger"
              :disabled="!isExporting"
              @click="cancelExport"
            >
              取消导出
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 进度条 -->
    <el-card v-if="showProgress" shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>导出进度</span>
        </div>
      </template>
      
      <div class="progress-container">
        <div class="progress-info mb-2">
          <span>{{ progressText }}</span>
          <span class="float-right">{{ progress }}%</span>
        </div>
        <el-progress
          :percentage="progress"
          :status="progressStatus"
          :stroke-width="20"
        />
        <div class="progress-detail mt-2 text-sm text-gray-500">
          {{ progressDetail }}
        </div>
      </div>
    </el-card>
    
    <!-- 导出结果 -->
    <el-card v-if="exportResult" shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>导出结果</span>
        </div>
      </template>
      
      <div class="result-container">
        <div class="result-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <el-statistic title="导出行数" :value="exportResult.totalRows" />
          <el-statistic title="导出列数" :value="exportResult.totalCols" />
          <el-statistic title="文件大小" :value="exportResult.fileSize" suffix="KB" />
          <el-statistic title="处理时间" :value="exportResult.processTime" suffix="ms" />
        </div>
        
        <el-alert
          :title="exportResult.success ? '导出成功' : '导出失败'"
          :type="exportResult.success ? 'success' : 'error'"
          show-icon
          class="mb-6"
        >
          {{ exportResult.message }}
        </el-alert>
        
        <!-- 导出文件信息 -->
        <div v-if="exportResult.success" class="file-info">
          <h3 class="text-lg font-semibold mb-3">文件信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="文件名">{{ exportResult.fileName }}</el-descriptions-item>
            <el-descriptions-item label="文件格式">{{ exportForm.fileFormat.toUpperCase() }}</el-descriptions-item>
            <el-descriptions-item label="工作表数">1</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="mt-4">
            <el-button type="primary" @click="downloadFile">
              <el-icon><Download /></el-icon>
              重新下载
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 数据预览 -->
    <el-card v-if="previewData.length > 0" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据预览</span>
        </div>
      </template>
      
      <div class="preview-container">
        <el-table :data="previewData.slice(0, 10)" style="width: 100%" max-height="400">
          <el-table-column
            v-for="(prop, index) in Object.keys(previewData[0] || {})"
            :key="index"
            :prop="prop"
            :label="prop"
            show-overflow-tooltip
          />
        </el-table>
        <div class="text-sm text-gray-500 mt-2">
          仅显示前10行数据，共{{ previewData.length }}行
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18nModule } from '@/composables/useI18nModule'

// 自动加载导入导出模块的语言包
useI18nModule('import-export')

// 组件状态
const isExporting = ref(false)
const showProgress = ref(false)
const progress = ref(0)
const progressText = ref('准备导出')
const progressStatus = ref('')
const progressDetail = ref('')
const exportResult = ref(null)
const previewData = ref([])
const exportWorker = ref(null)
const exportBlob = ref(null)

// 表单数据
const exportForm = reactive({
  dataSource: 'sample',
  sampleRows: 10000,
  sampleCols: 20,
  fileFormat: 'xlsx',
  sheetName: 'Sheet1',
  includeHeader: true,
  dateFormat: 'yyyy-mm-dd HH:MM:SS'
})

// 生成示例数据
const generateSampleData = () => {
  const { sampleRows, sampleCols } = exportForm
  const data = []
  
  // 生成列名（A-Z, AA-AZ等）
  const generateColumnName = (index) => {
    let name = ''
    let i = index
    while (i >= 0) {
      name = String.fromCharCode(65 + (i % 26)) + name
      i = Math.floor(i / 26) - 1
    }
    return name
  }
  
  // 生成数据行
  for (let row = 0; row < sampleRows; row++) {
    const rowData = {}
    for (let col = 0; col < sampleCols; col++) {
      const colName = generateColumnName(col)
      
      // 根据列索引生成不同类型的数据
      if (col === 0) {
        rowData[colName] = `ID-${String(row + 1).padStart(6, '0')}` // ID
      } else if (col === 1) {
        rowData[colName] = `名称-${row + 1}` // 名称
      } else if (col === 2) {
        rowData[colName] = Math.floor(Math.random() * 1000) + 1 // 数值
      } else if (col === 3) {
        rowData[colName] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // 日期
      } else if (col === 4) {
        rowData[colName] = Math.random() > 0.5 ? '是' : '否' // 布尔值
      } else {
        rowData[colName] = `数据-${row + 1}-${col + 1}` // 普通文本
      }
    }
    data.push(rowData)
  }
  
  return data
}

// 获取当前页面数据（模拟）
const getCurrentPageData = () => {
  // 模拟从当前页面获取数据
  return generateSampleData()
}

// 开始导出
const handleExport = async () => {
  isExporting.value = true
  showProgress.value = true
  progress.value = 0
  progressText.value = '准备导出'
  progressStatus.value = ''
  progressDetail.value = ''
  exportResult.value = null
  
  try {
    // 使用Web Worker导出，避免阻塞主线程（支持10万行数据）
    await exportWithWorker()
  } catch (error) {
    handleExportError(error)
  } finally {
    isExporting.value = false
  }
}

// 使用Web Worker导出（支持10万行数据，避免阻塞主线程）
const exportWithWorker = () => {
  return new Promise((resolve, reject) => {
    // 创建Web Worker（使用独立的worker文件，避免CDN加载问题）
    // 使用动态导入来确保 Worker 能正确加载
    const workerUrl = new URL('../workers/exportExcel.worker.js', import.meta.url)
    const worker = new Worker(workerUrl, { type: 'module' })
    
    console.log('[Main] Worker URL:', workerUrl.href)
      
    exportWorker.value = worker
    
    // 监听Worker消息
    worker.onmessage = (e) => {
      const { type, progress: workerProgress, message, detail, fileData, fileFormat, totalRows, totalCols, processTime, outputType, error } = e.data;
      
      switch (type) {
        case 'progress':
          progress.value = workerProgress;
          progressText.value = message;
          progressDetail.value = detail;
          break;
        case 'complete':
          console.log('[Main] 收到Worker完成消息，开始处理');
          console.log('[Main] 收到的数据信息:', {
            fileData: typeof fileData, 
            fileDataLength: fileData?.length || 0,
            outputType: outputType,
            fileFormat: fileFormat,
            totalRows: totalRows,
            totalCols: totalCols
          });
          
          progress.value = 100;
          progressText.value = '导出完成';
          progressStatus.value = 'success';
          progressDetail.value = '文件生成完成，准备下载';
          
          // 处理接收到的文件数据
          let blob;
          let finalFileData = fileData;
          
          try {
            console.log('[Main] 开始处理文件数据，数据类型:', typeof finalFileData);
            
            // 根据outputType处理不同类型的文件数据
            let blobData;
            
            if (outputType === 'binary') {
              // 处理binary类型数据（字符串）
              console.log('[Main] 处理binary类型数据，长度:', finalFileData.length);
              blobData = new Uint8Array(finalFileData.length);
              for (let i = 0; i < finalFileData.length; i++) {
                blobData[i] = finalFileData.charCodeAt(i);
              }
              console.log('[Main] binary数据转换完成，blobData长度:', blobData.length);
            } else if (Array.isArray(finalFileData)) {
              // 处理array类型数据（数组）
              console.log('[Main] 处理array类型数据，长度:', finalFileData.length);
              console.log('[Main] 数组前10个元素:', finalFileData.slice(0, 10));
              // 确保数组中的所有元素都是数字
              if (finalFileData.length > 0 && typeof finalFileData[0] !== 'number') {
                console.warn('[Main] 数组元素不是数字类型:', typeof finalFileData[0], '前几个元素:', finalFileData.slice(0, 5));
              }
              blobData = new Uint8Array(finalFileData);
              console.log('[Main] array数据转换完成，blobData长度:', blobData.length);
              console.log('[Main] blobData前10个字节:', Array.from(blobData.slice(0, 10)));
            } else if (finalFileData instanceof ArrayBuffer) {
              // 处理ArrayBuffer类型数据
              console.log('[Main] 处理ArrayBuffer类型数据，长度:', finalFileData.byteLength);
              blobData = new Uint8Array(finalFileData);
              console.log('[Main] ArrayBuffer转换完成，blobData长度:', blobData.length);
            } else {
              // 默认为array类型处理
              console.log('[Main] 处理其他类型数据，类型:', typeof finalFileData);
              blobData = new Uint8Array(finalFileData);
              console.log('[Main] 其他类型转换完成，blobData长度:', blobData.length);
            }
            
            // 创建Blob
            console.log('[Main] 开始创建Blob，blobData长度:', blobData.length);
            const mimeType = fileFormat === 'xlsx' 
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
              : 'application/vnd.ms-excel';
            
            blob = new Blob([blobData], { type: mimeType });
            console.log('[Main] Blob创建完成，Blob大小:', blob.size, 'bytes');
            exportBlob.value = blob;
          } catch (error) {
            console.error('[Main] 创建Blob失败:', error);
            throw error;
          }
          
          const fileName = `export_${new Date().getTime()}.${fileFormat}`;
          const fileSize = Math.round(blob.size / 1024);
          console.log('[Main] 生成文件名:', fileName, '文件大小:', fileSize, 'KB');
          
          // 生成预览数据（只显示前10行）
          console.log('[Main] 开始生成预览数据')
          const previewWorker = new Worker(
            new URL('../workers/previewExcel.worker.js', import.meta.url),
            { type: 'module' }
          )
          
          previewWorker.onmessage = (e) => {
            console.log('[Main] 收到预览数据，行数:', e.data.previewData?.length || 0)
            console.log('[Main] 预览数据样本:', e.data.previewData?.slice(0, 1) || [])
            previewData.value = e.data.previewData
            previewWorker.terminate()
          }
          
          previewWorker.onerror = (error) => {
            console.error('[Main] 预览Worker错误:', error)
            previewData.value = []
            previewWorker.terminate()
          }
          
          console.log('[Main] 发送预览数据请求')
          previewWorker.postMessage({ 
            fileData: finalFileData
          })
          
          exportResult.value = {
            success: true,
            message: `成功导出 ${totalRows} 行数据`,
            fileName: fileName,
            fileSize: fileSize,
            totalRows: totalRows,
            totalCols: totalCols,
            processTime: processTime
          };
          console.log('[Main] 导出结果:', exportResult.value);
          
          // 自动下载文件
          console.log('[Main] 开始下载文件');
          downloadFile(fileName, blob);
          console.log('[Main] 文件下载触发完成');
          
          ElMessage.success('文件导出成功');
          worker.terminate();
          exportWorker.value = null;
          console.log('[Main] 完成所有操作，Worker已终止');
          resolve();
          break;
        case 'error':
          handleExportError(new Error(error));
          worker.terminate();
          exportWorker.value = null;
          reject(new Error(error));
          break;
      }
    };
    
    worker.onerror = (error) => {
      console.error('[Main] Worker错误:', error)
      console.error('[Main] Worker错误详情:', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno
      })
      handleExportError(error);
      worker.terminate();
      exportWorker.value = null;
      reject(error);
    };
    
    // 发送配置到Worker，不发送大量数据
    // 明确列出需要传递的属性，避免传递Vue响应式对象的内部属性
    worker.postMessage({
      config: {
        dataSource: exportForm.dataSource,
        sampleRows: exportForm.sampleRows,
        sampleCols: exportForm.sampleCols,
        sheetName: exportForm.sheetName,
        includeHeader: exportForm.includeHeader,
        fileFormat: exportForm.fileFormat,
        dateFormat: exportForm.dateFormat
      }
    });
  });
}

// 下载文件
const downloadFile = (fileName, blob) => {
  const finalFileName = fileName || exportResult.value?.fileName;
  const finalBlob = blob || exportBlob.value;
  
  if (!finalFileName || !finalBlob) {
    ElMessage.warning('没有可下载的文件');
    return;
  }
  
  try {
    const url = URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('文件下载失败：' + error.message);
  }
}

// 取消导出
const cancelExport = () => {
  if (exportWorker.value) {
    exportWorker.value.terminate();
    exportWorker.value = null;
  }
  
  isExporting.value = false;
  progress.value = 0;
  progressText.value = '导出已取消';
  progressStatus.value = 'exception';
  progressDetail.value = '';
  
  ElMessage.warning('导出已取消');
}

// 处理导出错误
const handleExportError = (error) => {
  isExporting.value = false;
  progress.value = 0;
  progressText.value = '导出失败';
  progressStatus.value = 'exception';
  progressDetail.value = error.message;
  
  exportResult.value = {
    success: false,
    message: '文件导出失败：' + error.message,
    fileName: '',
    fileSize: 0,
    totalRows: 0,
    totalCols: 0,
    processTime: 0
  };
  
  ElMessage.error('文件导出失败：' + error.message);
}
</script>

<style scoped>
.export-file-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.export-setup {
  padding: 20px 0;
}

.sample-data-setting {
  margin-left: 120px;
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.progress-container {
  padding: 20px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-container {
  padding: 20px 0;
}

.result-stats {
  margin-bottom: 20px;
}

.preview-container {
  padding: 20px 0;
}

.file-info {
  margin-top: 20px;
}
</style>