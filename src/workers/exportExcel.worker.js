// Excel 导出 Worker
import * as XLSX from 'xlsx'

// 生成列名的函数
function generateColumnName(index) {
  let name = ''
  let i = index
  while (i >= 0) {
    name = String.fromCharCode(65 + (i % 26)) + name
    i = Math.floor(i / 26) - 1
  }
  return name
}

// 生成单行数据的函数
function generateRowData(rowIndex, config) {
  const { sampleCols } = config
  const rowData = {}
  
  for (let col = 0; col < sampleCols; col++) {
    const colName = generateColumnName(col)
    
    // 根据列索引生成不同类型的数据
    if (col === 0) {
      rowData[colName] = `ID-${String(rowIndex + 1).padStart(6, '0')}` // ID
    } else if (col === 1) {
      rowData[colName] = `名称-${rowIndex + 1}` // 名称
    } else if (col === 2) {
      rowData[colName] = Math.floor(Math.random() * 1000) + 1 // 数值
    } else if (col === 3) {
      rowData[colName] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // 日期
    } else if (col === 4) {
      rowData[colName] = Math.random() > 0.5 ? '是' : '否' // 布尔值
    } else {
      rowData[colName] = `数据-${rowIndex + 1}-${col + 1}` // 普通文本
    }
  }
  
  return rowData
}

// 在模块加载时检查 XLSX
console.log('[Worker] Worker 模块加载，检查 XLSX:', typeof XLSX, XLSX ? Object.keys(XLSX) : 'undefined')

self.onmessage = function(e) {
  const { config } = e.data
  
  console.log('[Worker] 收到配置:', config)
  
  // 检查 XLSX 库是否已加载
  if (typeof XLSX === 'undefined' || !XLSX || !XLSX.utils) {
    const errorMsg = `XLSX 库未正确加载。XLSX类型: ${typeof XLSX}, 是否有utils: ${XLSX?.utils ? '是' : '否'}`
    console.error('[Worker]', errorMsg)
    self.postMessage({
      type: 'error',
      error: errorMsg
    })
    return
  }
  
  console.log('[Worker] XLSX 库已加载，准备开始处理')
  
  try {
      const startTime = performance.now();

      // 配置
      const { sheetName, includeHeader, fileFormat, dateFormat, dataSource, sampleRows, sampleCols } = config;
      const batchSize = 5000; // 批次大小，用于进度更新

      // 创建工作簿
      const workbook = XLSX.utils.book_new();

      const totalRows = sampleRows;
      const totalCols = sampleCols;

      // 生成完整的数据
      const allData = [];
      console.log('[Worker] 开始生成数据，总行数:', totalRows, '总列数:', totalCols);

      for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
          const rowData = generateRowData(rowIndex, { sampleCols });
          allData.push(rowData);

          // 发送进度更新
          if ((rowIndex + 1) % batchSize === 0 || rowIndex + 1 === totalRows) {
              const progress = Math.round(((rowIndex + 1) / totalRows) * 80); // 数据生成占80%进度
              self.postMessage({
                  type: 'progress',
                  progress: progress,
                  message: `正在生成数据：第 ${rowIndex + 1} 行，共 ${totalRows} 行`,
                  detail: `已处理 ${rowIndex + 1} 条数据，共 ${totalCols} 列`,
              });
          }
      }

      console.log('[Worker] 数据生成完成，数据量:', allData.length, '条');

      // 发送进度：数据生成完成，开始创建工作表
      self.postMessage({
          type: 'progress',
          progress: 85,
          message: '正在创建工作表',
          detail: '将数据转换为Excel格式',
      });

      // 使用SheetJS内置方法创建工作表
      // 确保数据不为空
      if (!allData || allData.length === 0) {
          throw new Error('生成的数据为空，无法创建Excel文件');
      }

      console.log('[Worker] 准备创建工作表，数据量:', allData.length);
      if (allData.length > 0) {
          console.log('[Worker] 第一条数据:', JSON.stringify(allData[0]).substring(0, 200));
          console.log('[Worker] 第一条数据的键:', Object.keys(allData[0]));
      }
      console.log('[Worker] includeHeader:', includeHeader, 'skipHeader:', !includeHeader);

      // 确保 json_to_sheet 方法存在
      if (!XLSX.utils || !XLSX.utils.json_to_sheet) {
          throw new Error('XLSX.utils.json_to_sheet 方法不存在');
      }

      // 创建工作表
      let worksheet = XLSX.utils.json_to_sheet(allData, { skipHeader: !includeHeader });

      // 如果包含表头，为表头添加红色背景样式
      if (includeHeader && worksheet['!ref']) {
          // 获取表头行范围
          const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
          headerRange.e.r = headerRange.s.r; // 只处理第一行（表头行）

          // 为表头单元格添加红色背景样式
          for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
              const cell = worksheet[cellAddress];
              if (cell) {
                  // 注意：SheetJS免费版本的样式支持有限，这里使用简单的实现方式
                  // 直接修改单元格的t（type）和v（value）属性
                  // 使用HTML样式标记来实现红色背景效果

                  // 保存原始值
                  const originalValue = cell.v;

                  // 重新创建单元格，使用富文本格式
                  worksheet[cellAddress] = {
                      t: 's', // 字符串类型
                      v: originalValue, // 原始值
                      s: {
                          fill: {
                              patternType: 'solid', // 纯色填充
                              fgColor: { rgb: 'FFFF0000' }, // 红色背景
                          },
                          font: {
                              color: { rgb: 'FFFFFFFF' }, // 白色文字
                              bold: true, // 加粗
                          },
                      },
                  };
              }
          }
      }
      console.log('[Worker] 工作表对象已创建');

      // 验证工作表是否有数据
      // 注意：如果只有表头，!ref 可能是 'A1:Z1' 这样的范围
      if (!worksheet['!ref']) {
          throw new Error('工作表创建失败，工作表为空（没有 !ref）');
      }

      // 检查是否有实际的单元格数据（排除元数据）
      const cellKeys = Object.keys(worksheet).filter((k) => !k.startsWith('!'));
      if (cellKeys.length === 0) {
          throw new Error('工作表创建失败，没有单元格数据');
      }

      console.log('[Worker] 工作表创建完成，工作表结构:', {
          ref: worksheet['!ref'],
          hasData: Object.keys(worksheet).length > 0,
          cellCount: Object.keys(worksheet).filter((k) => !k.startsWith('!')).length,
      });

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      console.log('[Worker] 工作表添加完成，工作簿包含工作表:', workbook.SheetNames);

      // 发送进度：开始生成文件
      self.postMessage({
          type: 'progress',
          progress: 90,
          message: '正在生成Excel文件',
          detail: '转换文件格式',
      });

      // 生成Excel文件
      // 验证工作簿是否有工作表
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('工作簿中没有工作表');
      }

      // 直接使用 binary 类型，更可靠且易于处理
      const outputType = 'binary';
      const wopts = {
          bookType: fileFormat,
          bookSST: false,
          type: outputType,
          cellDates: true,
          dateNF: dateFormat,
          compression: true,
          cellStyles: true, // 启用单元格样式支持
      };

      console.log('[Worker] 开始生成Excel文件，格式:', fileFormat, '类型:', outputType);
      const fileData = XLSX.write(workbook, wopts);

      console.log('[Worker] XLSX.write 返回类型:', typeof fileData, '长度:', fileData?.length);

      // 验证生成的文件数据是否有效
      if (!fileData || (typeof fileData === 'string' && fileData.length === 0)) {
          throw new Error('生成的Excel文件数据为空');
      }

      // binary类型应该返回字符串
      if (typeof fileData !== 'string') {
          console.warn('[Worker] binary类型返回的不是字符串，实际类型:', typeof fileData);
          throw new Error(`binary类型应该返回字符串，但返回了 ${typeof fileData}`);
      }

      console.log('[Worker] binary类型文件生成成功，文件大小:', fileData.length, 'bytes');

      const processTime = Math.round(performance.now() - startTime);
      console.log('[Worker] 文件生成完成，总耗时:', processTime, 'ms');

      // 发送完成消息
      // binary类型返回的是字符串，可以直接发送
      const sendData = fileData;

      console.log(
          '[Worker] 准备发送完成消息，数据类型:',
          typeof sendData,
          '长度:',
          sendData.length,
          '前10个字符:',
          sendData.substring(0, 10)
      );
      self.postMessage({
          type: 'complete',
          fileData: sendData,
          fileFormat: fileFormat,
          totalRows: totalRows,
          totalCols: totalCols,
          processTime: processTime,
          outputType: outputType,
      });
      console.log('[Worker] 完成消息发送成功');
  } catch (error) {
    console.error('[Worker] 导出失败:', error)
    self.postMessage({
      type: 'error',
      error: error.message + ' Stack: ' + error.stack
    })
  }
}

