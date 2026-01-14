import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { apiLogin, type LoginResponseResult, type UserInfo } from "@/api/login.ts";
import { getUrlParam } from "@/Utilities/urlHelper.ts";

// TODO: 何時重新驗證
// PD驗證
export const useAuthStore = defineStore("authStore", () => {
  const rawData = ref<UserInfo>();
  // 記錄讀取狀態
  const isLoading = ref(false);
  // 記錄錯誤訊息
  const error = ref<string | null>(null);

  const userInfo = ref<{ username: string; code: string, authorization: string | null }>({
    username: "",
    code: "",
    authorization: null
  });

  // 從 API 獲取模板的 action
  const checkLogin = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // 使用者名稱
      const username: string = getUrlParam("username");
      // 使用者token
      const token: string = getUrlParam("token");
      // 使用者驗證碼
      const logincode: string = getUrlParam("logincode");
      const env: string = getUrlParam("env");

      const result: LoginResponseResult = await apiLogin({ username, token, logincode, env });
      if (result.status) {
        rawData.value = result.data;
        userInfo.value.authorization = result.data?.authorization || null;
        userInfo.value.username = username || "";
        return result;
      } else {
        error.value = result.error || "驗證失敗";
        return null;
      }
    } catch (e: any) {
      error.value = e.error;
    } finally {
      isLoading.value = false;
    }
  };
  // 是否登入
  const isLogin = () => {
    return !!userInfo.value.authorization;
  };
  // 授權碼
  const authorization = computed(() => userInfo.value.authorization);

  return {
    isLoading,
    error,
    checkLogin,
    isLogin,
    authorization,
    userInfo,
  };
});
