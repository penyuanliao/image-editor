import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import VueKonva from "vue-konva";
import ColorPickers from "colorpickers";
import "./style.scss";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "colorpickers/style.css";
import App from "./App.vue";
import router from "./router";

import {createGtm} from "@gtm-support/vue-gtm";
// import App from './AppKonva.vue'

const pinia = createPinia();
const app = createApp(App)
app.use(pinia);
app.use(router);
app.use(VueKonva);
app.use(ElementPlus);
app.use(ColorPickers);

const gtmOptions = {
  id: import.meta.env.VITE_GTM_ID, // 從 .env 檔案讀取 GTM ID
  enabled: false, // import.meta.env.PROD, // 只在正式環境 (production) 啟用
  debug: import.meta.env.DEV, // 在開發環境 (development) 啟用除錯模式
  vueRouter: router, // 傳入 router 實例以自動追蹤頁面瀏覽
  trackOnNextTick: false, // 建議設為 false 以立即追蹤
}

try {
  if (gtmOptions.enabled && gtmOptions.id) app.use(createGtm(gtmOptions));
} catch (e) {
  console.error(e);
} finally {
  if (gtmOptions.debug) {
    console.log(`## GTM Environment:
    |id: ${gtmOptions.id}
    |enabled: ${gtmOptions.enabled}
    |debug: ${gtmOptions.debug}
    `);
  }
}


app.mount("#app");
