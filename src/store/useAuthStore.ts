import {defineStore} from 'pinia';
import {computed, ref} from 'vue';

export interface ResponseResult {
    status: boolean;
    error?: string;
    data: {
        authorization: string;
    };
}
// TODO: 何時重新驗證
// PD驗證
export const useAuthStore = defineStore('authStore', () => {

    const rawData = ref<Record<number, any>>({});
    // 記錄讀取狀態
    const isLoading = ref(false);
    // 記錄錯誤訊息
    const error = ref<string | null>(null);

    const _authorization = ref<string | null>(null);

    // 從 API 獲取模板的 action
    const fetchAuth = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const contentType: string = 'application/json';
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            // 使用者名稱
            const user: string = urlParams.get('user') || '';
            // 使用者sid
            const sid: string = urlParams.get('sid') || '';
            // 使用者驗證碼
            const authentication: string = urlParams.get('token') || '';

            const response = await fetch(`/api/frontend/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType
                },
                body: JSON.stringify({
                    user,
                    sid,
                    authentication
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch auth');
            }
            const result: ResponseResult = await response.json();
            if (result.status) {
                rawData.value = result.data;
                _authorization.value = result.data?.authorization;
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
        return (!!_authorization.value);
    }
    // 授權碼
    const authorization = computed(() => _authorization.value);

    return {
        isLoading,
        error,
        fetchAuth,
        isLogin,
        authorization
    };
});