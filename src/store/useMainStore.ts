import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { ElLoading } from "element-plus";
import { useUploadStore } from "@/store/useUploadStore.ts";
import { nanoid } from "nanoid";
import { useAccountStore } from "@/store/useAccountStore.ts";
import { NStorageManager } from "@/library/NStorageManager.ts";
import { useAlertStore } from "@/store/useAlertStore.ts";
import { apiUrlRecord } from "@/api/urlRecord.ts";
import { useAIGenStore } from "@/store/useAIGenStore.ts";
import { dealy } from "@/Utilities/Utility.ts";
import { useRoute } from "vue-router";

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
  const routes = useRoute();
  // State (狀態)
  const isLoading = ref<boolean>(false);
  const theme = ref<string>("light");
  // 系統版本
  const version = ref<string>(__APP_VERSION__);

  const environment = ref<string>(import.meta.env.MODE);

  const isDev = computed(() => import.meta.env.MODE === "dev");

  const storageData = ref<{ help: boolean }>({ help: false });

  // 跑馬燈資料
  const marqueeText = ref<string>("");
  // 載入狀態
  const state = ref<"loading" | "completed" | "denied">("loading");
  // 監聽PostMessage回傳
  const postMessageBlock = ref<Record<string, any>>({});

  const commentVisible = ref<boolean>(false);

  const layersVisible = ref<boolean>(true);

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
  const showComment = (status: boolean) => {
    commentVisible.value = status;
  }
  const showLayers = computed({
    get: () => layersVisible.value,
    set: (value: boolean) => {
      layersVisible.value = value;
    }
  })

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
  // 開始登入
  const startLogin = async () => {
    // 1. 檢查是否由PD另外開啟頁面
    if (!window.opener && !isDev.value) {
      setState("denied");
      return;
    }
    const accountStore = useAccountStore();
    const aiGenStore = useAIGenStore();
    // 2. 開始進行檢查登入狀態
    if (!accountStore.isLogin()) await accountStore.checkLogin();
    console.log("開始進行檢查登入狀態", accountStore.isLogin(), accountStore.userInfo.remainingTries);
    // 設定: 跑馬燈訊息
    setMarqueeText(accountStore.userInfo.marqueeText || "");
    aiGenStore.setRemainingTries(accountStore.userInfo.remainingTries);
    // 設定: AI次數
    if (!accountStore.isLogin()) {
      setState("denied");
      return;
    }
    setState("completed");
  }
  // 展演使用不登入
  const startLoginDemo = async () => {
    setState("completed");
  }
  const pdUpload = async (blob: Blob, fileName: string): Promise<{ status: PDUploadState, url: string | null, path: string }> => {
    const url: string = decodeURI(routes.query.upload_url as string);
    console.log(`上傳圖片網址: ${url}`, routes.query.upload_url);
    // 2. 開始上傳檔案至後台PD
    const metaData = {
      hallId: routes.query.hid as string || "6",
      width: routes.query.width as string,
      height: routes.query.height as string,
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
      return { status: PD_UPLOAD_STATE.FAILURE_UPLOAD, url: "", path: "" };
    } else {
      waiting.setText(`上傳完成`);
      await dealy(1);
    }
    console.log("executeUpload", result);
    waiting.setText(`更新中...`)
    // 3. 通知PD完成上傳
    const openerResult = await new Promise<{ status: boolean, message?: string }>((resolve) => {
      const uuid = nanoid(12);
      postMessageBlock.value[uuid] = resolve;
      window.opener?.postMessage({ uuid, url: result.data.path }, "*");
      // 超時5秒
      setTimeout(() => {
        postMessageBlock.value[uuid] = null;
        resolve({ status: false, message: "timeout" });
      }, 5000);
    });
    console.log("openerResult", openerResult);

    if (!openerResult.status) {
      waiting.setText(`更新失敗`);
      waiting.close();
      // 通知失敗
      return { status: PD_UPLOAD_STATE.FAILURE_SEND_MESSAGE, url: result.data.link, path: result.data.path };
    } else {
      waiting.setText(`更新完成`);
      waiting.close();
      return { status: PD_UPLOAD_STATE.SUCCESS, url: result.data.link, path: result.data.path };
    }
  };
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
  };
  const updateUrlRecord = async (url: string, attempts: number = 1) => {
    const accountStore = useAccountStore();
    const authorization = accountStore.authorization || "";

    for (let i = 0; i < attempts; i++) {
      const result = await apiUrlRecord({ imageurl: url }, { authorization }).catch(() => { return { status: false }; });
      if (result.status) return result;
    }
    return { status: false };
  }
  // 下載Local
  const startUploadAndDownload = async (blob: Blob, href: string, fileName: string) => {
    const alertStore = useAlertStore();
    // 1. 檢查是否完成下載後，確認上傳完成直接關閉視窗
    const state: string = await alertStore.alertConfirmUploadAndDownload();
    console.log(`1. state: ${state}`);
    if (state === "close" || state === "cancel") return; // 取消上傳

    // 2. 開始上傳檔案至後台PD
    const uploadResult = await pdUpload(blob, fileName);
    if (uploadResult.status !== PD_UPLOAD_STATE.SUCCESS) {

      const failed = await alertStore.alertUploadFailed();
      if (failed === "confirm") {
        download(href, fileName);
      }
    } else {
      // 2. 執行下載
      download(href, fileName);
      // 3. 執行紀錄上傳網址
      if (uploadResult.url) await updateUrlRecord(uploadResult.url, 5);
    }

    // 4. 執行關閉
    window.close();
  };
  // 上傳PD
  const startUpload = async (blob: Blob, href: string, fileName: string) => {
    const alertStore = useAlertStore();
    // 1. 檢查是否已完成編輯，確認上傳完成直接關閉視窗
    const state: string = await alertStore.alertConfirmUpload();
    console.log(`1. state: ${state}`);
    if (state === "close" || state === "cancel") return; // 取消上傳
    const uploadResult = await pdUpload(blob, fileName);
    if (uploadResult.status !== PD_UPLOAD_STATE.SUCCESS) {
      const failed = await alertStore.alertUploadFailed();
      if (failed === "confirm") {
        download(href, fileName);
      }
    } else {
      // 2. 執行紀錄上傳網址
      if (uploadResult.url) await updateUrlRecord(uploadResult.url, 5);
    }
    // 3. 執行是否關閉
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
    environment,
    isDev,
    commentVisible,
    layersVisible,
    theme,
    version,
    marqueeText,
    state,
    setLoading,
    toggleTheme,
    setState,
    showComment,
    showLayers,
    setMarqueeText,
    initialization,
    startLogin,
    startLoginDemo,
    startUpload,
    startUploadAndDownload,
    setStorage
  };
});
