import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import VueKonva from "vue-konva";
import './style.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
// import App from './AppKonva.vue'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(VueKonva);
app.use(ElementPlus);
app.mount('#app')
