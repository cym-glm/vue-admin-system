# 国际化（i18n）使用说明

## 概述

本项目使用 Vue I18n 实现国际化，支持中文（zh-CN）、英文（en-US）、日语（ja-JP）和印地语（hi-IN）。

## 架构设计

### 词条分组优化

为了优化首屏加载性能，将1200多个词条分为两部分：

1. **核心语言包（Core Pack）**：约200个高频词条
   - 位置：`src/locales/core/`
   - 包含：通用操作、登录注册、菜单导航、用户权限、表格操作、消息提示、表单验证、时间等
   - 加载方式：与主包一起加载，增加约200KB

2. **模块语言包（Module Pack）**：约1000个业务模块词条
   - 位置：`src/locales/modules/`
   - 包含：导入导出、用户管理、仪表盘等业务模块
   - 加载方式：按需加载（lazy load），仅在进入对应模块时加载

### 文件结构

```
src/locales/
├── core/                 # 核心语言包（与主包一起加载）
│   ├── zh-CN.js         # 中文核心包
│   ├── en-US.js         # 英文核心包
│   ├── ja-JP.js         # 日语核心包
│   └── hi-IN.js         # 印地语核心包
├── modules/              # 模块语言包（按需加载）
│   └── import-export/   # 导入导出模块
│       ├── zh-CN.js
│       ├── en-US.js
│       ├── ja-JP.js
│       └── hi-IN.js
└── README.md
```

## 使用方法

### 1. 在组件中使用 i18n

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('common.confirm') }}</h1>
    <button>{{ t('common.cancel') }}</button>
  </div>
</template>
```

### 2. 按需加载模块语言包

在需要使用模块翻译的组件中，使用 `useI18nModule` composable：

```vue
<script setup>
import { useI18nModule } from '@/composables/useI18nModule'

// 自动加载导入导出模块的语言包
useI18nModule('import-export')

// 或者加载多个模块
useI18nModule(['import-export', 'user'])

// 禁用自动加载，手动控制
const { loadModules } = useI18nModule('import-export', { autoLoad: false })
// 然后在需要的时候调用
loadModules()
</script>

<template>
  <div>
    <!-- 使用模块翻译 -->
    <h1>{{ $t('importExport.import.title') }}</h1>
  </div>
</template>
```

### 3. 切换语言

```javascript
import { setI18nLocale } from '@/i18n'

// 切换语言
await setI18nLocale('en-US')
```

### 4. 获取支持的语言列表

```javascript
import { getSupportedLocales } from '@/i18n/utils'

const locales = getSupportedLocales()
// [
//   { code: 'zh-CN', name: '中文', nativeName: '中文（简体）' },
//   { code: 'en-US', name: 'English', nativeName: 'English (US)' },
//   ...
// ]
```

## 添加新模块语言包

### 1. 创建模块语言包文件

在 `src/locales/modules/your-module/` 目录下创建对应语言的 JS 文件：

```javascript
// src/locales/modules/your-module/zh-CN.js
export default {
  yourModule: {
    title: '模块标题',
    // ... 其他翻译
  }
}
```

### 2. 在 i18n/index.js 中注册模块

```javascript
// src/i18n/index.js
export async function loadModuleMessages(locale, moduleName) {
  // ...
  switch (moduleName) {
    case 'your-module':
      moduleMessages = await import(`@/locales/modules/your-module/${locale}.js`)
      break
    // ...
  }
}
```

### 3. 在组件中使用

```vue
<script setup>
import { useI18nModule } from '@/composables/useI18nModule'

useI18nModule('your-module')
</script>
```

## 打包优化说明

### Vite 配置

Vite 会自动处理动态导入（`import()`），将模块语言包打包成独立的 chunk：

- 核心语言包：包含在主 bundle 中
- 模块语言包：单独打包成 chunk，按需加载

### 性能优化

1. **首屏优化**：核心包约200KB，与主包一起加载，不增加额外请求
2. **按需加载**：模块包仅在需要时加载，减少初始加载时间
3. **缓存策略**：使用 sessionStorage 缓存已加载的模块，避免重复加载

## 注意事项

1. 模块语言包的键名应该使用模块名作为顶层键，避免冲突
2. 切换语言时，已加载的模块语言包需要重新加载（已在 `setI18nLocale` 中处理）
3. 模块加载失败时会静默处理，不影响页面功能

