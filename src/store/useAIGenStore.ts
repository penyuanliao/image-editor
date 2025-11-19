import {defineStore} from 'pinia';
import {ref} from 'vue';

export interface ResponseResult {
    status: boolean;
    error?: string;
    image: string;
}
// originalimage, materialid, originalurl 三則一
export interface AIGenRequest {
    originalimage?: string;
    materialid?: number;
    materialurl?: string; // choice = 0 有 materialid
    originalurl?: string;
    prompt?: string;
    choice: number;
}
// 產生的AI圖片action
export const useAIGenStore = defineStore('aiGenStore', () => {
    // 使用次數
    const remainingTries = ref<number>(50);
    // 存放原始圖片資料
    const originalImages: Map<number, { image?: HTMLImageElement, base64?: string, id: number, blob?:Blob }> = new Map();
    // 存放處理過後圖片資料
    const rawData = ref<Record<number, any>>({});
    // 記錄讀取狀態
    const isLoading = ref(false);
    // 記錄錯誤訊息
    const error = ref<string | null>(null);

    // 從 API 獲取模板的 action
    const fetchGenerate = async (source: {
        image: HTMLImageElement,
        id: number,
        materialId?: number,
        url?: string,
        base64?: string,
        blob?:Blob
    }, args: {
        prompt?: string,
        choice: number,
    }) => {
        isLoading.value = true;
        error.value = null;
        try {
            const contentType: string = 'application/json';
            const body:AIGenRequest  = {
                choice: args.choice
            };
            if (source.materialId && source.materialId > 0) {
                body.materialid = source.materialId;
                if (args.choice === 0) body.materialurl = source.url;
            } else if (source.base64) {
                body.originalimage = source.base64.replace(/^data:image\/[a-z]+;base64,/, '')
            } else {
                body.originalurl = source.image.src;
            }
            // 選擇的
            if (args.prompt && args.choice === 0) {
                body.prompt = args.prompt;
            }
            // 這裡替換成你真實的 API 請求
            const response = await fetch(`/api/frontend/image/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType
                },
                body: JSON.stringify(body)
            });
            remainingTries.value--;
            // 記錄原圖
            if (source.id > 0 && !originalImages.has(source.id)) {
                originalImages.set(source.id, source);
            }
            if (!response.ok) {
                throw new Error('Failed to fetch api generated');
            }
            const result: ResponseResult = await response.json();
            if (result.status) {
                if (rawData.value[source.id]) {
                    rawData.value[source.id].push(result.image);
                } else {
                    rawData.value[source.id] = [result.image];
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

    const hasOriginalImage = (id: number) => {
        return originalImages.has(id);
    }
    const getOriginalImage = (id: number) => {
        return originalImages.get(id);
    }

    return {
        remainingTries,
        isLoading,
        error,
        fetchGenerate,
        hasOriginalImage,
        getOriginalImage
    };
});