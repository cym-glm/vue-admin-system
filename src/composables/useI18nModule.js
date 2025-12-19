import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadModuleMessages, mergeModuleMessages } from '@/i18n'

/**
 * 使用 i18n 模块的 composable
 * 在组件挂载时自动加载指定的模块语言包
 * 
 * @param {string|string[]} moduleNames - 模块名称或模块名称数组
 * @param {Object} options - 选项
 * @param {boolean} options.autoLoad - 是否自动加载，默认 true
 */
export function useI18nModule(moduleNames, options = {}) {
  const { autoLoad = true } = options
  const { locale } = useI18n()
  
  const modules = Array.isArray(moduleNames) ? moduleNames : [moduleNames]
  
  /**
   * 加载模块语言包
   */
  const loadModules = async () => {
    const i18n = useI18n()
    const currentLocale = locale.value
    
    for (const moduleName of modules) {
      try {
        // 检查是否已加载（使用 sessionStorage 作为简单缓存）
        const cacheKey = `i18n-module-${moduleName}-${currentLocale}`
        if (sessionStorage.getItem(cacheKey)) {
          continue
        }
        
        // 加载模块语言包
        const messages = await loadModuleMessages(currentLocale, moduleName)
        
        if (messages && Object.keys(messages).length > 0) {
          // 合并到 i18n 实例
          mergeModuleMessages(i18n, currentLocale, moduleName, messages)
          
          // 标记为已加载
          sessionStorage.setItem(cacheKey, 'loaded')
          
          console.log(`[i18n] Module ${moduleName} loaded for locale ${currentLocale}`)
        }
      } catch (error) {
        console.error(`[i18n] Failed to load module ${moduleName}:`, error)
      }
    }
  }
  
  // 如果启用自动加载，在组件挂载时加载
  if (autoLoad) {
    onMounted(() => {
      loadModules()
    })
  }
  
  return {
    loadModules
  }
}

