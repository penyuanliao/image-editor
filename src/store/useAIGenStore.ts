import {defineStore} from 'pinia';
import {ref} from 'vue';

export interface ResponseResult {
    status: boolean;
    message?: string;
    data: any;
}
// 產生的AI圖片action
export const useAIGenStore = defineStore('aiGenStore', () => {
    // 存放模板列表
    const rawData = ref<any[]>([]);
    // 記錄讀取狀態
    const isLoading = ref(false);
    // 記錄錯誤訊息
    const error = ref<string | null>(null);

    // 從 API 獲取模板的 action
    const fetchMaterials = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            // 這裡替換成你真實的 API 請求
            const response = await fetch('/api/ai-generated');
            if (!response.ok) {
                throw new Error('Failed to fetch api generated');
            }
            const result: ResponseResult = await response.json();
            if (result.status) rawData.value = result.data;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        error,
        fetchMaterials,
    };
});