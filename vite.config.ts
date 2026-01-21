import { type ConfigEnv, defineConfig, type ViteDevServer } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import pkg from "./package.json";
import { proxyConfig } from "./src/config/proxy.ts";
import { API_ENDPOINTS } from "./src/api/endpoints.ts";

export default defineConfig((configEnv: ConfigEnv) => {
  const isDev = configEnv.mode === "dev";
  let count: number = 0;
  function serverPlugin() {
    if (!isDev) return;
    return {
      name: "mock-api-server",
      configureServer(server: ViteDevServer) {
        server.middlewares.use(
          async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            if (req.url === API_ENDPOINTS.GET_MATERIALS || req.url === API_ENDPOINTS.COMMENT) {
              let file: string = '';
              if (req.url === API_ENDPOINTS.GET_MATERIALS) file = "./src/test/material.json";
              if (req.url === API_ENDPOINTS.COMMENT) file = "./src/test/comment.json";
              const filePath = path.resolve(__dirname, file);
              const json = fs.readFileSync(filePath, "utf-8");
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000)); // 模擬網路延遲
              res.setHeader("Content-Type", "application/json");
              res.end(json);
              return;
            }
            if (req.url === API_ENDPOINTS.LOGIN) {

/*
              res.statusCode = 403;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                status: false,
                error: "deactivated"
              }));
              return;
*/
              const user: { token: string; username: string; logincode: string } = await new Promise(
                (resolve, reject) => {
                  let rawData = "";
                  req.on("data", (chunk) => {
                    rawData += chunk.toString();
                  });
                  req.on("end", () => {
                    try {
                      resolve(JSON.parse(rawData));
                    } catch (error) {
                      reject(error);
                    }
                  });
                }
              );
              const file: string =
                user.logincode !== "xxx"
                  ? "./src/test/login_success.json"
                  : "./src/test/login_fail.json";
              const filePath = path.resolve(__dirname, file);
              const json = fs.readFileSync(filePath, "utf-8");
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000)); // 模擬網路延遲
              res.setHeader("Content-Type", "application/json");
              res.end(json);
            }
            if (req.url === "/offer/uploadimg") {
              const filePath = path.resolve(__dirname, "./src/test/uploadImage.json");
              const json = fs.readFileSync(filePath, "utf-8");
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000)); // 模擬網路延遲
              res.setHeader("Content-Type", "application/json");
              res.end(json);
            }
            if (req.url === API_ENDPOINTS.IMAGE_GENERATE && req.method === 'POST') {
              console.log('authorization:', req.headers.authorization);
              const aiAPIs = ["./src/test/generate_success.json", "./src/test/generate_call_fail.json", "./src/test/generate_not_enough.json"];
              const filePath = path.resolve(__dirname, aiAPIs[count++ % 3]);
              const json = fs.readFileSync(filePath, "utf-8");
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000)); // 模擬網路延遲
              res.setHeader("Content-Type", "application/json");
              res.end(json);
              return;
            }
            if (req.url === API_ENDPOINTS.COMMENT && req.method === 'POST') {
              const filePath = path.resolve(__dirname, "./src/test/comment.json");
              const json = fs.readFileSync(filePath, "utf-8");
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000)); // 模擬網路延遲
              res.setHeader("Content-Type", "application/json");
              res.end(json);
            }
            next();
          }
        );
      }
    };
  }
  return {
    base: "/assets-editor",
    plugins: [vue(), serverPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version)
    },
    server: {
      host: true,
      proxy: isDev ? proxyConfig : undefined,
      allowedHosts: ['www.benson.com', 'admin.vir777.net', 'cdn.vir999.net']
    }
  };
});
