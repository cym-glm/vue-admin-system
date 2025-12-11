import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'
  return {
    base: isProd && env.VITE_CDN_BASE ? env.VITE_CDN_BASE : '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      sourcemap: isProd,
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: { comments: false }
      },
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue'],
            router: ['vue-router'],
            pinia: ['pinia'],
            element: ['element-plus', '@element-plus/icons-vue']
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (name && name.endsWith('.css')) return 'assets/[name]-[hash].css'
            return 'assets/[name]-[hash][extname]'
      }
    },
    test: {
      environment: 'jsdom'
    }
  }
}
  }
})
