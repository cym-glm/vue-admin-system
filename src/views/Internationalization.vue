<template>
  <div class="internationalization-container">
    <h1 class="text-2xl font-bold mb-6">{{ $t('menu.internationalization') }}</h1>
    
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>{{ $t('i18n.languageSettings') }}</span>
        </div>
      </template>
      
      <div class="language-settings">
        <el-form :model="languageForm" label-width="150px">
          <el-form-item :label="$t('i18n.currentLanguage')">
            <el-select 
              v-model="currentLanguage" 
              @change="handleLanguageChange"
              style="width: 200px"
            >
              <el-option
                v-for="locale in supportedLocales"
                :key="locale.code"
                :label="locale.nativeName"
                :value="locale.code"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item :label="$t('i18n.languagePreview')">
            <div class="preview-text">
              <p><strong>{{ $t('common.confirm') }}</strong>: {{ $t('common.confirm') }}</p>
              <p><strong>{{ $t('common.cancel') }}</strong>: {{ $t('common.cancel') }}</p>
              <p><strong>{{ $t('common.save') }}</strong>: {{ $t('common.save') }}</p>
              <p><strong>{{ $t('auth.login') }}</strong>: {{ $t('auth.login') }}</p>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <el-card shadow="hover" class="mb-6">
      <template #header>
        <div class="card-header">
          <span>{{ $t('i18n.languagePackInfo') }}</span>
        </div>
      </template>
      
      <div class="language-pack-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('i18n.corePackSize')">
            ~{{ corePackSize }} KB ({{ $t('i18n.loadedWithMainBundle') }})
          </el-descriptions-item>
          <el-descriptions-item :label="$t('i18n.totalEntries')">
            ~{{ totalEntries }} {{ $t('i18n.entries') }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('i18n.coreEntries')">
            ~{{ coreEntries }} {{ $t('i18n.entries') }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('i18n.moduleEntries')">
            ~{{ moduleEntries }} {{ $t('i18n.entries') }} ({{ $t('i18n.lazyLoaded') }})
          </el-descriptions-item>
          <el-descriptions-item :label="$t('i18n.supportedLanguages')" :span="2">
            {{ supportedLocales.map(l => l.nativeName).join(', ') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
    
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('i18n.loadedModules') }}</span>
        </div>
      </template>
      
      <div class="loaded-modules">
        <el-table :data="loadedModulesList" style="width: 100%">
          <el-table-column :label="$t('i18n.moduleName')" prop="name" />
          <el-table-column :label="$t('i18n.loadStatus')" prop="status">
            <template #default="{ row }">
              <el-tag :type="row.status === 'loaded' ? 'success' : 'info'">
                {{ row.status === 'loaded' ? $t('i18n.loaded') : $t('i18n.notLoaded') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('i18n.operations')">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'not-loaded'"
                type="primary" 
                size="small"
                @click="loadModule(row.name)"
              >
                {{ $t('i18n.loadModule') }}
              </el-button>
              <el-button 
                v-else
                type="success" 
                size="small"
                disabled
              >
                {{ $t('i18n.alreadyLoaded') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSupportedLocales } from '@/i18n/utils'
import { loadModuleMessages, mergeModuleMessages, setI18nLocale } from '@/i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

// 支持的语言列表
const supportedLocales = getSupportedLocales()

// 当前语言
const currentLanguage = ref(locale.value)

// 语言表单（用于显示）
const languageForm = ref({})

// 语言包信息
const corePackSize = ref(200) // 核心包大小约200KB
const totalEntries = ref(1200) // 总词条数
const coreEntries = ref(200) // 核心词条数
const moduleEntries = ref(1000) // 模块词条数

// 已加载的模块列表
const loadedModulesList = ref([
  { name: 'import-export', status: 'not-loaded', displayName: '导入导出模块' }
])

// 已加载模块的映射
const loadedModulesMap = ref(new Map())

// 切换语言
const handleLanguageChange = async (newLocale) => {
  try {
    await setI18nLocale(newLocale)
    ElMessage.success(t('i18n.languageChanged'))
    
    // 如果已有模块加载，需要重新加载模块消息
    for (const [moduleName] of loadedModulesMap.value) {
      await loadModule(moduleName, true)
    }
  } catch (error) {
    console.error('Failed to change language:', error)
    ElMessage.error(t('i18n.languageChangeFailed'))
  }
}

// 加载模块
const loadModule = async (moduleName, silent = false) => {
  if (loadedModulesMap.value.has(moduleName) && !silent) {
    ElMessage.warning(t('i18n.moduleAlreadyLoaded'))
    return
  }
  
  try {
    const i18n = useI18n()
    const messages = await loadModuleMessages(locale.value, moduleName)
    
    if (messages && Object.keys(messages).length > 0) {
      mergeModuleMessages(i18n, locale.value, moduleName, messages)
      loadedModulesMap.value.set(moduleName, true)
      
      // 更新模块状态
      const module = loadedModulesList.value.find(m => m.name === moduleName)
      if (module) {
        module.status = 'loaded'
      }
      
      if (!silent) {
        ElMessage.success(t('i18n.moduleLoadedSuccess'))
      }
    } else {
      if (!silent) {
        ElMessage.warning(t('i18n.moduleLoadFailed'))
      }
    }
  } catch (error) {
    console.error(`Failed to load module ${moduleName}:`, error)
    if (!silent) {
      ElMessage.error(t('i18n.moduleLoadError'))
    }
  }
}

// i18n 相关翻译已经在核心语言包中定义，这里不需要重复添加
</script>

<style scoped>
.internationalization-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.language-settings {
  padding: 20px 0;
}

.preview-text {
  padding: 15px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.preview-text p {
  margin: 8px 0;
  line-height: 1.8;
}

.language-pack-info {
  padding: 20px 0;
}

.loaded-modules {
  padding: 20px 0;
}
</style>

