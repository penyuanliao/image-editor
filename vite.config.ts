import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import pkg from './package.json'
import { proxyConfig } from "./src/config/proxy.ts";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    }
  },
  define: {
    '__APP_VERSION__': JSON.stringify(pkg.version),
  },
  server: {
    host: true,
    proxy: proxyConfig
  },
})
