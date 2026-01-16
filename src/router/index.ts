import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// 定義您的路由規則
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/AppEditorView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/assets-editor",
    name: "Editor",
    component: () => import("@/views/AppEditorView.vue")
  },
  {
    path: "/assets-editor/help",
    name: "Help",
    component: () => import("@/views/Help.vue")
  },
  {
    path: "/assets-editor/denied",
    name: "Denied",
    // 假設您有一個顯示存取被拒絕的頁面
    component: () => import("@/views/AccessDenied.vue")
  },
  {
    // 過濾網站無效路徑
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    // 假設您有一個顯示存取被拒絕的頁面
    component: () => import("@/views/NotFound.vue")
  }
];

// 建立 router 實例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export { router as default };
