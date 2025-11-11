import {defineStore} from 'pinia';
import {ref} from 'vue';

export interface ResponseResult {
    status: boolean;
    message?: string;
    data: any;
}
// 產生的AI圖片action
export const useAIGenStore = defineStore('aiGenStore', () => {
    const originalImages: Map<number, { image: HTMLImageElement, base64?: string, id: number, blob?:Blob }> = new Map();
    // 存放處理過後圖片資料
    const rawData = ref<any[]>([]);
    // 記錄讀取狀態
    const isLoading = ref(false);
    // 記錄錯誤訊息
    const error = ref<string | null>(null);

    // 從 API 獲取模板的 action
    const fetchGenerate = async (source: {
        image: HTMLImageElement,
        id: number,
        base64?: string,
        blob?:Blob
    }, args: {
        prompt?: string,
        choice: number,
    }) => {
        isLoading.value = true;
        error.value = null;
        try {
            let contentType: string;
            let body;
            let query = '';
            if (source.blob) {
                contentType = 'multipart/form-data';
                body = new FormData();
                body.append('image', source.blob);
            } else {
                contentType = 'application/json';
                body = JSON.stringify({
                    image: source.base64
                });
            }
            if (args.choice >= 0) {
                query = `?id=${source.id}`;
            }
            // 選擇的
            if (args.prompt && args.choice === 0) {
                query += `&prompt=${args.prompt}`;
            }


            // 這裡替換成你真實的 API 請求
            const response = await fetch(`/api/image/generate${query}`, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType
                },
                body
            });
            // 記錄原圖
            if (source.id > 0 && !originalImages.has(source.id)) {
                originalImages.set(source.id, source);
            }
            if (!response.ok) {
                throw new Error('Failed to fetch api generated');
            }
            const result: ResponseResult = await response.json();
            if (result.status) {
                rawData.value = result.data;
                return result.data;
            } else {
                return null;
            }
        } catch (e: any) {
            error.value = e.message;
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
        isLoading,
        error,
        fetchGenerate,
        hasOriginalImage,
        getOriginalImage
    };
});