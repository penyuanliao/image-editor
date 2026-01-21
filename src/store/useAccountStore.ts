import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { apiLogin, type LoginResponseResult, type UserInfo } from "@/api/login.ts";
import { useRoute } from "vue-router";

// TODO: 何時重新驗證
// PD驗證
export const useAccountStore = defineStore("accountStore", () => {
  const rawData = ref<UserInfo>();
  // 記錄讀取狀態
  const isLoading = ref(false);
  // 記錄錯誤訊息
  const error = ref<string | null>(null);

  const userInfo = ref<{ username: string; code: string, authorization: string | null, marqueeText: string, remainingTries: number }>({
    username: "",
    code: "",
    authorization: null,
    marqueeText: "",
    remainingTries: 0
  });
  const routes = useRoute();

  // 從 API 獲取模板的 action
  const checkLogin = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // 使用者名稱
      const username: string = routes.query.username as string;
      // 使用者token
      const token: string = routes.query.token as string;
      // 使用者驗證碼
      const logincode: string = routes.query.logincode as string;

      const hid: number = Number.parseInt(routes.query.hid as string || "0");

      const result: LoginResponseResult = await apiLogin({ username, token, logincode, hid }).catch((error: string) => {
        return { status: false, message: "驗證失敗", error };
      });
      if (result.status) {
        rawData.value = result.data;
        userInfo.value.authorization = result.data?.token || null;
        userInfo.value.username = username || "";
        userInfo.value.marqueeText = result.data?.marquee || "";
        userInfo.value.remainingTries = result.data?.remainingTries || 0;
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
