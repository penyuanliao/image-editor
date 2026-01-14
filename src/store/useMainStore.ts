import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { ElLoading } from "element-plus";
import { useUploadStore } from "@/store/useUploadStore.ts";
import { getUrlParam } from "@/Utilities/urlHelper.ts";
import { ConfirmMessage } from "@/Utilities/AlertMessage.ts";
import { nanoid } from "nanoid";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { NStorageManager } from "@/library/NStorageManager.ts";

const PD_UPLOAD_STATE = {
  WAIT: 0,
  UPLOADING: 1,
  FAILURE_UPLOAD: 2,
  FAILURE_SEND_MESSAGE: 2,
  SUCCESS: 3
} as const;
type PDUploadState = typeof PD_UPLOAD_STATE[keyof typeof PD_UPLOAD_STATE];

// 第一個參數 'main' 是 Store 的唯一 ID
export const useMainStore = defineStore("main", () => {
  const uploadStore = useUploadStore();

  // State (狀態)
  const isLoading = ref<boolean>(false);
  const theme = ref<string>("light");
  // 系統版本
  const version = ref<string>(__APP_VERSION__);

  const isDev = computed(() => import.meta.env.MODE === "dev");

  const storageData = ref<{ help: boolean }>({ help: false });

  // 跑馬燈資料
  const marqueeText = ref<string>("這是跑馬燈訊息");
  // 載入狀態
  const state = ref<"loading" | "completed" | "denied">("loading");
  // 監聽PostMessage回傳
  const postMessageBlock = ref<Record<string, any>>({});

  const commentVisible = ref<boolean>(false);

  // 訊息
  const onMessage = (event: MessageEvent) => {
    console.log(`Received message from origin: ${event.origin} data: ${JSON.stringify(event.data)}`);
    if (postMessageBlock.value && event.data?.uuid) {
      const block = postMessageBlock.value[event.data.uuid];
      block({
        ...event.data,
        origin: event.origin,
      });
      postMessageBlock.value[event.data.uuid] = null;
    }
  };

  // Actions (動作)
  const setLoading = (status: boolean) => {
    isLoading.value = status;
  };
  const setCommentVisible = (status: boolean) => {
    commentVisible.value = status;
  }

  const setState = (newState: "loading" | "completed" | "denied") => {
    state.value = newState;
  };

  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
  };

  const initialization = () => {
    // 登入
    window.removeEventListener("message", onMessage); // 確保不會重複綁定
    window.addEventListener("message", onMessage);

    setupStorage();
  };
  const setMarqueeText = (text: string) => {
    marqueeText.value = text.trim();
  }
  const startLogin = async () => {
    // 1. 檢查是否由PD另外開啟頁面
    if (!window.opener && !isDev.value) {
      setState("denied");
      return;
    }
    const authStore = useAuthStore();
    // 2. 開始進行檢查登入狀態
    await authStore.checkLogin();
    if (!authStore.isLogin()) {
      setState("denied");
      return;
    }
    setState("completed");
  }
  const pdUpload = async (blob: Blob, fileName: string): Promise<PDUploadState> => {
    const url: string = getUrlParam("upload_url");

    // 2. 開始上傳檔案至後台PD
    const metaData = {
      hallId: getUrlParam("hallId"),
      width: getUrlParam("width"),
      height: getUrlParam("height"),
      url
    };

    // 需要一個等待畫面
    const waiting = ElLoading.service({
      lock: true,
      text: "上傳中...",
      customClass: "custom-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });
    const result = await uploadStore.executeUpload(fileName, blob, metaData);

    if (!result || !result.status) {
      // 失敗怎麼辦
      waiting.setText(`上傳失敗`);
      waiting.close();
      return PD_UPLOAD_STATE.FAILURE_UPLOAD;
    }
    console.log("executeUpload", result);
    // 3. 通知PD完成上傳
    const openerResult = await new Promise<{ status: boolean, message?: string }>((resolve) => {
      const uuid = nanoid(12);
      postMessageBlock.value[uuid] = resolve;
      window.opener?.postMessage({ uuid, url: result.data.link }, "*");
      // 超時5秒
      setTimeout(() => {
        postMessageBlock.value[uuid] = null;
        resolve({ status: false, message: "timeout" });
      }, 5000);
    });
    console.log("openerResult", openerResult);
    waiting.setText(`更新失敗`);
    waiting.close();
    if (!openerResult.status) {
      // 通知失敗
      return PD_UPLOAD_STATE.FAILURE_SEND_MESSAGE;
    } else {
      return PD_UPLOAD_STATE.SUCCESS;
    }
  };
  // 上傳失敗流程
  const failureRule = async (href: string, fileName: string) => {
    // 跳出Alert通知需要下載不然要關閉視窗
    const state: string = await ConfirmMessage({
      message:
        '<div style="text-align: center; user-select: none; font-size: 16px;">視窗即將關閉，需要下載請按[確認]</div>',
      title: "無法上傳您的所有檔案",
      confirmText: "確認",
      cancelText: "關閉"
    });
    if (state === "confirm") {
      download(href, fileName);
    }
  }
  const download = (href: string, fileName: string) => {
    if (href) {
      // 2. 將暫時畫布的內容轉換為圖片的 data URL 並觸發下載
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName || `edited-image-${Date.now()}.png`; // 加上時間戳避免檔名重複
      document.body.appendChild(link); // Firefox 需要將 link 加入 DOM
      link.click();
      document.body.removeChild(link); // 清理 DOM
    }
  }
  // 下載Local
  const startUploadAndDownload = async (blob: Blob, href: string, fileName: string) => {
    // 1. 檢查是否完成下載後，確認上傳完成直接關閉視窗
    const message: string = `<div style="text-align: center; user-select: none; font-size: 16px;">您是否要下載圖片？<br/>點擊「是」將會把圖片下載至本地<br/>並關閉管宣生成器</div>`;
    const title: string = "下載圖片關閉確認";
    const state: string = await ConfirmMessage({
      message,
      title,
      confirmText: "是",
      cancelText: "否",
    });
    console.log(`1. state: ${state}`);
    if (state === "close" || state === "cancel") return; // 取消上傳

    // 2. 開始上傳檔案至後台PD
    const uploadState: PDUploadState = await pdUpload(blob, fileName);
    if (uploadState !== PD_UPLOAD_STATE.SUCCESS) {
      await failureRule(href, fileName);
    } else {
      // 2. 執行下載
      download(href, fileName);
    }

    // 3. 執行關閉
    window.close();
  };
  // 上傳PD
  const startUpload = async (blob: Blob, href: string, fileName: string) => {
    // 1. 檢查是否已完成編輯，確認上傳完成直接關閉視窗
    const state: string = await ConfirmMessage({
      message:
        '<div style="text-align: center; user-select: none; font-size: 16px;">您是否已完成编辑？<br/>点击「是」将会把图片传送至后台<br/>并关闭广宣生成器<br/></div>',
      title: "完成编辑确认",
      confirmText: "是",
      cancelText: "否",
    });
    console.log(`1. state: ${state}`);
    if (state === "close" || state === "cancel") return; // 取消上傳
    const uploadState = await pdUpload(blob, fileName);
    if (uploadState !== PD_UPLOAD_STATE.SUCCESS) {
      await failureRule(href, fileName);
    }
    // 2. 執行是否關閉
    window.close();
  };
  
  const setStorage = (key: string, value: any) => {
    (storageData.value as Record<string, any>)[key] = value;
    NStorageManager.set("storageData", JSON.stringify(storageData.value));
  }
  const setupStorage = () => {
    const data = NStorageManager.get("storageData");
    if (Object.keys(data).length > 0) {
      storageData.value = data;
    } else {
      NStorageManager.set("storageData", JSON.stringify(storageData.value));
    }
  }

  return {
    isLoading,
    isDev,
    commentVisible,
    theme,
    version,
    marqueeText,
    state,
    setLoading,
    toggleTheme,
    setState,
    setCommentVisible,
    setMarqueeText,
    initialization,
    startLogin,
    startUpload,
    startUploadAndDownload,
    setStorage
  };
});
