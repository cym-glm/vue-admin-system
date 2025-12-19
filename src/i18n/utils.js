// i18n 工具函数

const LOCALE_KEY = 'vue-admin-locale'

/**
 * 获取当前语言
 * @returns {string} 语言代码
 */
export function getLocale() {
  try {
    return localStorage.getItem(LOCALE_KEY) || 'zh-CN'
  } catch (error) {
    console.error('Failed to get locale from localStorage:', error)
    return 'zh-CN'
  }
}

/**
 * 设置语言
 * @param {string} locale - 语言代码
 */
export function setLocale(locale) {
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch (error) {
    console.error('Failed to set locale to localStorage:', error)
  }
}

/**
 * 获取支持的语言列表
 * @returns {Array} 语言列表
 */
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '中文', nativeName: '中文（简体）' },
    { code: 'en-US', name: 'English', nativeName: 'English (US)' },
    { code: 'ja-JP', name: '日本語', nativeName: '日本語' },
    { code: 'hi-IN', name: 'हिंदी', nativeName: 'हिंदी' }
  ]
}

