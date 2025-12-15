import {type ConfigEnv, defineConfig, type ViteDevServer} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import type { IncomingMessage, ServerResponse } from 'http'
import pkg from './package.json'
import { proxyConfig } from "./src/config/proxy.ts";
import { API_ENDPOINTS } from "./src/api/endpoints.ts";

export default defineConfig((configEnv: ConfigEnv) => {
  const isDev = configEnv.mode === "dev";
  function serverPlugin() {
    if (!isDev) return;
    return {
      name: 'mock-api-server',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.url === API_ENDPOINTS.GET_MATERIALS) {
            const filePath = path.resolve(__dirname, './src/test/material.json');
            const json = fs.readFileSync(filePath, 'utf-8');
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000)); // 模擬網路延遲
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
            return;
          }
          if (req.url === API_ENDPOINTS.LOGIN) {
            const filePath = path.resolve(__dirname, './src/test/loginSuccessful.json');
            const json = fs.readFileSync(filePath, 'utf-8');
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5000)); // 模擬網路延遲
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
          }

          // if (req.url === API_ENDPOINTS.IMAGE_GENERATE && req.method === 'POST') {
          //   // 模擬一個成功的 AI 圖片生成回應
          //   await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬網路延遲
          //   const response = {
          //     status: true,
          //     // 回傳一個 1x1 的透明像素作為假圖片
          //     image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
          //   };
          //   res.setHeader('Content-Type', 'application/json');
          //   res.end(JSON.stringify(response));
          //   return;
          // }
          next();
        });
      }
    }
  }
  return {
    base: './',
    plugins: [vue(), serverPlugin()],
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
      proxy: isDev ? proxyConfig : undefined
    },
  };
})
