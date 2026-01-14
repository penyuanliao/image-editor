import {defineStore} from "pinia";
import {ref, computed} from "vue";
import { uploadImage, type UploadImageResult } from "@/api/uploader.ts";
import type { LoadingInstance } from "element-plus";

export const useUploadStore = defineStore("uploadStore", () => {
    // --- State ---
    const isUploading = ref(false);
    const uploadProgress = ref(0); // 如果未來 axios 有支援 onUploadProgress 可以用
    const error = ref<string | null>(null);
    const lastUploadedResult = ref<UploadImageResult | null>(null);

    // --- Getters ---
    const isLoading = computed(() => isUploading.value);

    // --- Actions ---
    /**
     * 執行圖片上傳
     * @param fileName 檔案名稱
     * @param blob 圖片 Blob 物件
     * @param metaData 額外參數 (hallId, width, height 等)
     * @param loadingInstance
     */
    const executeUpload = async (
        fileName: string,
        blob: Blob,
        metaData?: { hallId?: string; width?: string; height?: string; bytes?: string; url?: string },
        loadingInstance?: LoadingInstance
    ):Promise<UploadImageResult | null> => {
        if (isUploading.value) return null;

        isUploading.value = true;
        error.value = null;
        lastUploadedResult.value = null;

        try {
            const result = await uploadImage(fileName, blob, metaData, (percent: number) => {
              if (loadingInstance) {
                loadingInstance.setText(`上傳中... ${percent}%`);
              }
            });

            if (result && result.status === "Y") {
                lastUploadedResult.value = result;
                return result;
            } else {
                error.value = result?.message || "上傳失敗，未知的錯誤";
                return null;
            }
        } catch (e: any) {
            error.value = e.message || "上傳過程中發生錯誤";
            return null;
        } finally {
            isUploading.value = false;
        }
    };

    /**
     * 重置上傳狀態
     */
    const resetState = () => {
        isUploading.value = false;
        error.value = null;
        lastUploadedResult.value = null;
        uploadProgress.value = 0;
    };

    return {
        // State
        isUploading,
        uploadProgress,
        error,
        lastUploadedResult,

        // Getters
        isLoading,

        // Actions
        executeUpload,
        resetState
    };
});