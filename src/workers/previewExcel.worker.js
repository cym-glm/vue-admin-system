// Excel 预览 Worker
import * as XLSX from 'xlsx'

self.onmessage = function(e) {
  try {
    const { fileData } = e.data
    console.log('[PreviewWorker] 收到数据，类型:', typeof fileData, '长度:', fileData?.length || 0)
    
    let workbook
    let readSuccess = false
    
    // 尝试不同的读取方式
    try {
      // 如果是数组，转换为Uint8Array
      if (Array.isArray(fileData)) {
        workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' })
      } else if (fileData instanceof ArrayBuffer) {
        workbook = XLSX.read(fileData, { type: 'array' })
      } else {
        workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' })
      }
      console.log('[PreviewWorker] 成功使用array类型读取')
      readSuccess = true
    } catch (readError) {
      console.log('[PreviewWorker] array类型读取失败:', readError.message)
      try {
        workbook = XLSX.read(fileData, { type: 'binary' })
        console.log('[PreviewWorker] 成功使用binary类型读取')
        readSuccess = true
      } catch (binaryError) {
        console.log('[PreviewWorker] binary类型读取失败:', binaryError.message)
      }
    }
    
    if (readSuccess && workbook) {
      console.log('[PreviewWorker] 成功读取工作簿，包含工作表:', workbook.SheetNames)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      console.log('[PreviewWorker] 工作表信息:', {
        ref: worksheet['!ref'],
        hasData: Object.keys(worksheet).length > 0
      })
      
      const previewData = XLSX.utils.sheet_to_json(worksheet, { limit: 10 })
      console.log('[PreviewWorker] 预览数据生成完成，预览行数:', previewData.length)
      self.postMessage({ previewData })
    } else {
      console.log('[PreviewWorker] 无法读取文件，返回空预览数据')
      self.postMessage({ previewData: [] })
    }
  } catch (error) {
    console.error('[PreviewWorker] 处理错误:', error)
    self.postMessage({ previewData: [] })
  }
}

