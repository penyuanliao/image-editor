import { defineStore } from "pinia";
import {computed, ref} from "vue";
import { type AIGenRequest, type ImageGenerateResult, apiImageGenerate } from "@/api/generate.ts";
import { useAuthStore } from "@/store/useAuthStore.ts";

export interface IGenerateSource {
  image: HTMLImageElement;
  id: string; // elementId
  materialId?: number;
  url?: string;
  base64?: string;
}
// 產生的AI圖片action
export const useAIGenStore = defineStore("aiGenStore", () => {
  // 使用次數
  const remainingTries = ref<number>(100);
  // 存放原始圖片資料
  const originalImages: Map<
    string,
    { image?: HTMLImageElement; base64?: string; id: string; blob?: Blob }
  > = new Map();
  // 存放處理過後圖片資料
  const rawData = ref<Record<number, any>>({});
  // 記錄讀取狀態
  const isUploading = ref(false);
  // 記錄錯誤訊息
  const error = ref<string | null>(null);

  const isLoading = computed(() => isUploading.value);

  // 從 API 獲取模板的 action
  const fetchGenerate = async (
    source: IGenerateSource,
    args: {
      prompt?: string;
      choice?: number;
      color?: string;
      matting?: boolean;
    }
  ) => {

    if (isLoading.value) return Promise.reject("正在處理中");
    isUploading.value = true;
    error.value = null;
    try {
      // 這邊有5個流程
      // 1. 物件轉換
      // 2. 風格轉換
      // 3. 自訂生成
      // 4. 更換顏色
      // 5. 移除背景
      const body: AIGenRequest = {};
      // 1-1. 如果有帶素材編號就不是自己上傳物件
      if (source.materialId && source.materialId > 0) {
        body.materialid = source.materialId;
      } else if (source.base64) {
        // 1-2. 這邊是手動上傳的圖片
        body.originalimage = source.base64.replace(/^data:image\/[a-z]+;base64,/, "");
      } else {
        // 1-3. 想直接從素材庫取出來
        body.originalurl = source.image.src;
      }

      const choice = args.choice || 0;
      // 1. 物件轉換模式、2. 風格轉換模式
      if (choice > 0) {
        body.choice = choice;
      } else if (args.prompt && choice === 0) {
        // 3. 檢查是否選擇自訂生成
        body.prompt = args.prompt;
        body.materialurl = source.url;
      } else if (args.color) {
        // 4. 顏色轉換
        body.color = args.color;
      } else if (args.matting) {
        // 5. 移除背景
        body.mask = args.matting;
      } else {

      }
      const authStore = useAuthStore();

      const authorization = authStore.authorization || "";

      const result: ImageGenerateResult = await apiImageGenerate(JSON.stringify(body), { authorization });
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
        isUploading.value = false;
    }
  };

  const hasOriginalImage = (id: string) => {
    return originalImages.has(id);
  };
  const getOriginalImage = (id: string) => {
    return originalImages.get(id);
  };
  // 這邊紀錄原始圖片目的用於還原
  const setOriginalImage = (
    id: string,
    source: { image?: HTMLImageElement; base64?: string; id: string; blob?: Blob }
  ) => {
    return originalImages.set(id, source);
  };

  return {
    remainingTries,
    isLoading,
    error,
    fetchGenerate,
    hasOriginalImage,
    getOriginalImage,
    setOriginalImage,
  };
});
