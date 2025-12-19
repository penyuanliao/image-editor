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
// import {createGtm} from "@gtm-support/vue-gtm";
// import App from './AppKonva.vue'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(VueKonva);
app.use(ElementPlus);
app.use(ColorPickers);

// app.use(createGtm({
//     id: '',
//     enabled: false,
//     debug: import.meta.env.DEV
// }))

app.mount("#app");
