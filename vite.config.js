import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: '猪猪网站',
        short_name: '猪猪',
        description: '我们的爱情纪念网站',
        theme_color: '#D4A574',
        background_color: '#F5EDE4',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      // 图片和 API 缓存策略
      runtimeCaching: [
        {
          // 缓存图片 - 支持 Notion S3 和外部链接
          urlPattern: /^https:\/\/.+\.(png|jpg|jpeg|gif|webp|svg)/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 天
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // 缓存 Notion API 响应
          urlPattern: /^https:\/\/api\.notion\.com\/v1\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'notion-api',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60, // 1 分钟
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/notion-api': {
        target: 'https://api.notion.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/notion-api/, ''),
      },
    },
  },
});
