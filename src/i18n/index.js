import { createI18n } from 'vue-i18n'
import { getLocale, setLocale } from './utils'

// 导入核心语言包（与主包一起加载，约200个高频词条）
import coreZhCN from '@/locales/core/zh-CN'
import coreEnUS from '@/locales/core/en-US'
import coreJaJP from '@/locales/core/ja-JP'
import coreHiIN from '@/locales/core/hi-IN'

// 已加载的模块语言包缓存
const loadedModules = new Map()

/**
 * 按需加载模块语言包
 * @param {string} locale - 语言代码 (zh-CN, en-US, ja-JP, hi-IN)
 * @param {string} moduleName - 模块名称 (如: 'import-export')
 * @returns {Promise<Object>} 模块语言包对象
 */
export async function loadModuleMessages(locale, moduleName) {
  const cacheKey = `${locale}-${moduleName}`
  
  // 检查缓存
  if (loadedModules.has(cacheKey)) {
    return loadedModules.get(cacheKey)
  }
  
  try {
    // 动态导入模块语言包
    let moduleMessages
    switch (moduleName) {
      case 'import-export':
        moduleMessages = await import(`@/locales/modules/import-export/${locale}.js`)
        break
      // 可以在这里添加其他模块
      // case 'user':
      //   moduleMessages = await import(`@/locales/modules/user/${locale}.js`)
      //   break
      // case 'dashboard':
      //   moduleMessages = await import(`@/locales/modules/dashboard/${locale}.js`)
      //   break
      default:
        console.warn(`Unknown module: ${moduleName}`)
        return {}
    }
    
    const messages = moduleMessages.default || moduleMessages
    // 缓存已加载的模块
    loadedModules.set(cacheKey, messages)
    return messages
  } catch (error) {
    console.error(`Failed to load module ${moduleName} for locale ${locale}:`, error)
    return {}
  }
}

/**
 * 合并模块消息到 i18n 实例
 * @param {Object} i18n - i18n 实例
 * @param {string} locale - 语言代码
 * @param {string} moduleName - 模块名称
 * @param {Object} messages - 模块消息对象
 */
export function mergeModuleMessages(i18n, locale, moduleName, messages) {
  if (!messages || Object.keys(messages).length === 0) {
    return
  }
  
  // 合并消息到当前语言
  const currentMessages = i18n.getLocaleMessage(locale)
  i18n.setLocaleMessage(locale, {
    ...currentMessages,
    ...messages
  })
}

// 初始化核心语言包
const messages = {
  'zh-CN': coreZhCN,
  'en-US': coreEnUS,
  'ja-JP': coreJaJP,
  'hi-IN': coreHiIN
}

// 获取默认语言
const defaultLocale = getLocale() || 'zh-CN'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true, // 全局注入 $t
  warnHtmlMessage: false
})

/**
 * 切换语言并加载必要的模块
 * @param {string} locale - 语言代码
 */
export async function setI18nLocale(locale) {
  if (i18n.global.locale.value === locale) {
    return
  }
  
  // 设置新的语言
  i18n.global.locale.value = locale
  setLocale(locale)
  
  // 如果有已加载的模块，需要重新加载（因为语言改变了）
  // 这里可以根据实际需求决定是否清除缓存
  // loadedModules.clear() // 如果需要切换语言时重新加载所有模块，取消注释这行
}

export default i18n

