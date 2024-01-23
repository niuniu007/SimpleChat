import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    base: '/chat/', // 这里指定了项目编译后引用的资源文件的路径前缀为 /my-app/
    assetsInclude: ['**/assets/*.mp3'],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },

    plugins: [
      vue(),
      VitePWA({
        injectRegister: 'auto',
        manifest: {
          name: 'chatGPT',
          short_name: 'chatGPT',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 5335,
      open: false,
      proxy: {
        '/api': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true, // 允许跨域
          rewrite: path => path.replace('/api/', '/'),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          format: 'iife', // 指定输出格式为立即执行函数（Immediately Invoked Function Expression）
          inlineDynamicImports: true, // 将动态import转换为具体实现的代码，避免异步加载
        },
      },
      reportCompressedSize: false,
      sourcemap: false,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
    },
  }
})
