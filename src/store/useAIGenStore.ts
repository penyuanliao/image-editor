import { defineStore } from "pinia";
import {computed, ref} from "vue";
import { type AIGenRequest, type ImageGenerateResult, apiImageGenerate } from "@/api/generate.ts";
// 產生的AI圖片action
export const useAIGenStore = defineStore("aiGenStore", () => {
  // 使用次數
  const remainingTries = ref<number>(50);
  // 存放原始圖片資料
  const originalImages: Map<
    string,
    { image?: HTMLImageElement; base64?: string; id: string; blob?: Blob }
  > = new Map();
  // 存放處理過後圖片資料
  const rawData = ref<Record<number, any>>({});
  // 記錄讀取狀態
  const isLoading = ref(false);
  // 記錄錯誤訊息
  const error = ref<string | null>(null);

  const inProcessing = computed(() => isLoading.value);

  // 從 API 獲取模板的 action
  const fetchGenerate = async (
    source: {
      image: HTMLImageElement;
      id: string; // elementId
      materialId?: number;
      url?: string;
      base64?: string;
      blob?: Blob;
    },
    args: {
      prompt?: string;
      choice: number;
    }
  ) => {

    if (isLoading.value) return Promise.reject("正在處理中");

    isLoading.value = true;
    error.value = null;
    try {
      // 這邊有三個流程
      // 1. 物件轉換
      // 2. 風格轉換
      const body: AIGenRequest = {
        choice: args.choice // 轉換CODE
      };
      // 1. 如果有帶素材編號就不是自己上傳物件
      if (source.materialId && source.materialId > 0) {
        body.materialid = source.materialId;
      } else if (source.base64) {
        // 2. 這邊是手動上傳的圖片
        body.originalimage = source.base64.replace(/^data:image\/[a-z]+;base64,/, "");
      } else {
        // 3. 想直接從素材庫取出來
        body.originalurl = source.image.src;
      }
      // 檢查是否選擇自訂生成
      if (args.prompt && args.choice === 0) {
        body.prompt = args.prompt;
        body.materialurl = source.url;
      }
      const result: ImageGenerateResult = await apiImageGenerate(JSON.stringify(body));
      if (result.status) {
        remainingTries.value--;
        if (source.materialId) {
          if (rawData.value[source.materialId]) {
            rawData.value[source.materialId].push(result.image);
          } else {
            rawData.value[source.materialId] = [result.image];
          }
        }
        return result;
      } else {
        error.value = result.error || "生成失敗";
        return null;
      }
    } catch (e: any) {
      error.value = e.error;
    } finally {
      isLoading.value = false;
    }
  };

  const hasOriginalImage = (id: string) => {
    return originalImages.has(id);
  };
  const getOriginalImage = (id: string) => {
    return originalImages.get(id);
  };
  const setOriginalImage = (
    id: string,
    source: { image?: HTMLImageElement; base64?: string; id: string; blob?: Blob }
  ) => {
    return originalImages.set(id, source);
  };

  return {
    remainingTries,
    inProcessing,
    error,
    fetchGenerate,
    hasOriginalImage,
    getOriginalImage,
    setOriginalImage
  };
});
