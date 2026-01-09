import { defineStore } from "pinia";
import { ref } from "vue";
import { ElMessageBox } from "element-plus";
import { useUploadStore } from "@/store/useUploadStore.ts";
import { getUrlParam } from "@/Utilities/urlHelper.ts";
import { ConfirmMessage } from "@/Utilities/AlertMessage.ts";
import { nanoid } from "nanoid";

// 第一個參數 'main' 是 Store 的唯一 ID
export const useMainStore = defineStore("main", () => {
  const uploadStore = useUploadStore();
  // State (狀態)
  const isLoading = ref<boolean>(false);
  const theme = ref<string>("light");
  // 系統版本
  const version = ref<string>(__APP_VERSION__);
  // 跑馬燈資料
  const marqueeText = ref<string>("");
  // 載入狀態
  const state = ref<"loading" | "completed" | "denied">("loading");
  // 監聽PostMessage回傳
  const postMessageBlock = ref<Record<string, any>>({});
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
  };
  const setMarqueeText = (text: string) => {
    marqueeText.value = text.trim();
  }
  // 下載Local
  const startDownload = async (href: string) => {
    // 1. 檢查是否完成下載後，確認上傳完成直接關閉視窗
    const state: string = await ElMessageBox.confirm(
      '<div style="text-align: center; pointer-events: none;">您是否要下載圖片？<br/>點擊「是」將會把圖片下載至本地<br/>並關閉管宣生成器</div>',
      "下載圖片關閉確認",
      {
        confirmButtonText: "是",
        cancelButtonText: "否",
        draggable: false,
        dangerouslyUseHTMLString: true,
        distinguishCancelAndClose: true,
        center: true,
        confirmButtonClass: "custom-confirm-btn",
        cancelButtonClass: "custom-cancel-btn"
      }
    ).catch((reason) => {
      return reason;
    });
    const doneClosed = state === "confirm";
    console.log(`1. state: ${state}`);
    if (state === "close") return; // 取消上傳
    if (href) {
      // 2. 將暫時畫布的內容轉換為圖片的 data URL 並觸發下載
      const link = document.createElement("a");
      link.href = href;
      link.download = `edited-image-${Date.now()}.png`; // 加上時間戳避免檔名重複
      document.body.appendChild(link); // Firefox 需要將 link 加入 DOM
      link.click();
      document.body.removeChild(link); // 清理 DOM
    }
    // 3. 執行是否關閉
    if (doneClosed) window.close();
  };
  // 上傳PD
  const startUpload = async (fileName: string, blob: Blob) => {
    // 1. 檢查是否已完成編輯，確認上傳完成直接關閉視窗
    const state: string = await ConfirmMessage({
      message:
        '<div style="text-align: center;">您是否已完成編輯？<br/><br/>點擊「是」將會把圖片傳送至後台<br/>並關閉管宣生成器</div>',
      title: "完成編輯確認",
      confirmText: "是",
      cancelText: "否"
    });
    const doneClosed = state === "confirm";
    console.log(`1. state: ${state}`);
    if (state === "close") return; // 取消上傳

    // 2. 開始上傳檔案至後台PD
    const metaData = {
      hallId: getUrlParam("hallId"),
      width: getUrlParam("width"),
      height: getUrlParam("height")
    };
    const result = await uploadStore.executeUpload(fileName, blob, metaData);
    if (!result || !result.status) {
      // 失敗怎麼辦
      return;
    }
    // 3. 通知PD完成上傳
    const openerResult = await new Promise<{ status: boolean }>((resolve) => {
      const uuid = nanoid(12);
      postMessageBlock.value[uuid] = resolve;
      window.opener.postMessage({ uuid, url: result.data.link }, "*");
      // 超時5秒
      setTimeout(() => {
        postMessageBlock.value[uuid] = null;
        resolve({ status: false });
      }, 5000);
    });
    if (!openerResult.status) {
      // 失敗怎麼辦
    }
    // 執行是否關閉
    if (doneClosed) window.close();
  };

  return {
    isLoading,
    theme,
    version,
    marqueeText,
    state,
    setLoading,
    toggleTheme,
    setState,
    setMarqueeText,
    initialization,
    startUpload,
    startDownload
  };
});
