<template>
  <div class="import-file-container">
    <h1 class="text-2xl font-bold mb-6">文件导入</h1>
    
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>导入设置</span>
        </div>
      </template>
      
      <div class="import-setup">
        <el-form :model="importForm" label-width="120px">
          <el-form-item label="文件选择">
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              :before-upload="beforeUpload"
              accept=".xlsx,.xls"
              drag
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip text-sm text-gray-500">
                  支持.xlsx和.xls格式，建议单个文件不超过100MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="工作表选择">
            <el-select
              v-model="importForm.sheetIndex"
              placeholder="请选择工作表"
              :disabled="!availableSheets.length"
            >
              <el-option
                v-for="(sheet, index) in availableSheets"
                :key="index"
                :label="sheet"
                :value="index"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="isImporting"
              :disabled="!selectedFile || isImporting"
              @click="handleImport"
            >
              开始导入
            </el-button>
            <el-button
              type="danger"
              :disabled="!isImporting"
              @click="cancelImport"
            >
              取消导入
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 进度条 -->
    <el-card v-if="showProgress" shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>导入进度</span>
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
    
    <!-- 导入结果 -->
    <el-card v-if="importResult" shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>导入结果</span>
        </div>
      </template>
      
      <div class="result-container">
        <div class="result-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <el-statistic title="总行数" :value="importResult.totalRows" />
          <el-statistic title="成功行数" :value="importResult.successRows" />
          <el-statistic title="失败行数" :value="importResult.errorRows" />
          <el-statistic title="处理时间" :value="importResult.processTime" suffix="ms" />
        </div>
        
        <el-alert
          :title="importResult.success ? '导入成功' : '导入失败'"
          :type="importResult.success ? 'success' : 'error'"
          show-icon
          class="mb-6"
        >
          {{ importResult.message }}
        </el-alert>
        
        <!-- 预览数据 -->
        <div v-if="importResult.data.length > 0">
          <h3 class="text-lg font-semibold mb-3">数据预览</h3>
          <el-table :data="importResult.data.slice(0, 10)" style="width: 100%" max-height="400">
            <el-table-column
              v-for="(prop, index) in Object.keys(importResult.data[0] || {})"
              :key="index"
              :prop="prop"
              :label="prop"
              show-overflow-tooltip
            />
          </el-table>
          <div class="text-sm text-gray-500 mt-2">
            仅显示前10行数据，共{{ importResult.data.length }}行
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import * as XLSX from 'xlsx'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18nModule } from '@/composables/useI18nModule'

// 自动加载导入导出模块的语言包
useI18nModule('import-export')

// 组件状态
const uploadRef = ref(null)
const fileList = ref([])
const selectedFile = ref(null)
const isImporting = ref(false)
const showProgress = ref(false)
const progress = ref(0)
const progressText = ref('准备导入')
const progressStatus = ref('')
const progressDetail = ref('')
const availableSheets = ref([])
const importResult = ref(null)
const importWorker = ref(null)

// 表单数据
const importForm = reactive({
  sheetIndex: 0
})

// 文件选择处理
const handleFileChange = (file) => {
  selectedFile.value = file.raw
  fileList.value = [file]
  availableSheets.value = []
  
  // 预解析文件获取工作表信息
  preParseFile(file.raw)
}

// 预解析文件获取工作表
const preParseFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      availableSheets.value = workbook.SheetNames
      if (availableSheets.value.length > 0) {
        importForm.sheetIndex = 0
        ElMessage.success(`成功识别到 ${availableSheets.value.length} 个工作表`)
      }
    } catch (error) {
      ElMessage.error('文件预解析失败：' + error.message)
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsArrayBuffer(file)
}

// 上传前校验
const beforeUpload = (file) => {
  const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
  const allowedExtensions = ['.xlsx', '.xls']
  
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedExtensions.includes(fileExtension)) {
    ElMessage.error('仅支持.xlsx和.xls格式文件')
    return false
  }
  
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }
  
  return true
}

// 开始导入
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  isImporting.value = true
  showProgress.value = true
  progress.value = 0
  progressText.value = '开始导入'
  progressStatus.value = ''
  progressDetail.value = ''
  importResult.value = null
  
  try {
    await importWithWorker(selectedFile.value)
  } catch (error) {
    handleImportError(error)
  } finally {
    isImporting.value = false
  }
}

// 使用Web Worker导入
const importWithWorker = (file) => {
  return new Promise((resolve, reject) => {
    // 创建Web Worker
    const worker = new Worker(URL.createObjectURL(new Blob([`
      importScripts('https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js');
      
      self.onmessage = function(e) {
        const { fileData, sheetIndex } = e.data;
        
        try {
          const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
          const sheetName = workbook.SheetNames[sheetIndex];
          const worksheet = workbook.Sheets[sheetName];
          
          // 流式读取大型工作表
          const options = {
            raw: false,
            cellDates: true,
            dateNF: 'yyyy-mm-dd HH:MM:SS'
          };
          
          // 获取数据范围
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const totalRows = range.e.r + 1;
          const batchSize = 1000; // 每批处理1000行
          
          let allData = [];
          let currentRow = 0;
          
          // 分块处理数据
          while (currentRow < totalRows) {
            const endRow = Math.min(currentRow + batchSize, totalRows);
            const batchRange = XLSX.utils.encode_range({
              s: { c: range.s.c, r: currentRow },
              e: { c: range.e.c, r: endRow - 1 }
            });
            
            const batchData = XLSX.utils.sheet_to_json(worksheet, {
              ...options,
              range: batchRange
            });
            
            allData = allData.concat(batchData);
            currentRow = endRow;
            
            // 发送进度更新
            self.postMessage({
              type: 'progress',
              progress: Math.round((currentRow / totalRows) * 100),
              message: '正在处理第 ' + currentRow + ' 行，共 ' + totalRows + ' 行',
              detail: '已处理 ' + allData.length + ' 条数据'
            });
          }
          
          // 发送处理结果
          self.postMessage({
            type: 'complete',
            data: allData,
            totalRows: totalRows,
            successRows: allData.length,
            errorRows: 0
          });
        } catch (error) {
          self.postMessage({
            type: 'error',
            error: error.message
          });
        }
      };
    `], { type: 'application/javascript' })));
    
    importWorker.value = worker;
    
    // 监听Worker消息
    worker.onmessage = (e) => {
      const { type, progress: workerProgress, message, detail, data, totalRows, successRows, errorRows, error } = e.data;
      
      switch (type) {
        case 'progress':
          progress.value = workerProgress;
          progressText.value = message;
          progressDetail.value = detail;
          break;
        case 'complete':
          progress.value = 100;
          progressText.value = '导入完成';
          progressStatus.value = 'success';
          progressDetail.value = '数据处理完成';
          
          // 保存导入结果
          importResult.value = {
            success: true,
            message: `成功导入 ${successRows} 条数据`,
            totalRows: totalRows,
            successRows: successRows,
            errorRows: errorRows,
            processTime: 0, // 简化处理，实际项目中可添加计时
            data: data
          };
          
          ElMessage.success('文件导入成功');
          worker.terminate();
          importWorker.value = null;
          resolve();
          break;
        case 'error':
          handleImportError(new Error(error));
          worker.terminate();
          importWorker.value = null;
          reject(new Error(error));
          break;
      }
    };
    
    worker.onerror = (error) => {
      handleImportError(error);
      worker.terminate();
      importWorker.value = null;
      reject(error);
    };
    
    // 读取文件并发送到Worker
    const reader = new FileReader();
    reader.onload = (e) => {
      worker.postMessage({
        fileData: e.target.result,
        sheetIndex: importForm.sheetIndex
      });
    };
    
    reader.onerror = (error) => {
      handleImportError(error);
      worker.terminate();
      importWorker.value = null;
      reject(error);
    };
    
    reader.readAsArrayBuffer(selectedFile.value);
  });
}

// 取消导入
const cancelImport = () => {
  if (importWorker.value) {
    importWorker.value.terminate();
    importWorker.value = null;
  }
  
  isImporting.value = false;
  progress.value = 0;
  progressText.value = '导入已取消';
  progressStatus.value = 'exception';
  progressDetail.value = '';
  
  ElMessage.warning('导入已取消');
}

// 处理导入错误
const handleImportError = (error) => {
  isImporting.value = false;
  progress.value = 0;
  progressText.value = '导入失败';
  progressStatus.value = 'exception';
  progressDetail.value = error.message;
  
  importResult.value = {
    success: false,
    message: '文件导入失败：' + error.message,
    totalRows: 0,
    successRows: 0,
    errorRows: 0,
    processTime: 0,
    data: []
  };
  
  ElMessage.error('文件导入失败：' + error.message);
}
</script>

<style scoped>
.import-file-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-setup {
  padding: 20px 0;
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
</style>