import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiComment } from "@/api/comment.ts";
import { useAccountStore } from "@/store/useAccountStore.ts";

// 定義評論的資料介面 (根據您的後端 API 調整)
export interface IComment {
  content: string;
}

export const useCommentStore = defineStore("commentStore", () => {
  // --- State ---
  const comments = ref<IComment>({
    content: "",
  });
  const isUploading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => isUploading.value);

  // --- Actions ---
  /**
   * 新增評論
   * @param content 評論內容
   */
  const addComment = async (content: string) => {
    if (!content.trim()) return false;

    isUploading.value = true;
    try {
      const accountStore = useAccountStore();
      const result = await apiComment(content, { authorization: accountStore.authorization });
      return result.status;
    } catch (e: any) {
      error.value = e.message || "發送評論失敗";
    } finally {
      isUploading.value = false;
    }
    return false;
  };

  return {
    // State
    comments,
    isLoading,
    error,

    // Actions
    addComment,
  };
});