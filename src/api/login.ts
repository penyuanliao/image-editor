import { API_ENDPOINTS } from "./endpoints";

export interface LoginResponseResult {
  status: boolean;
  message?: string;
  data?: UserInfo;
  error?: string;
}
export interface UserInfo {
  token: string;
  quota: number;
  marquee: string;
}
export interface LoginRequestData {
  token: string;
  username: string;
  logincode: string;
  hid: number;
}

// 3. 建立一個專門用來擷取資料的函式
export const apiLogin = async (data: LoginRequestData): Promise<LoginResponseResult> => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {

    if (response.status === 403) {
      return response.json();
    }

    throw new Error(`status_${response.status}`);
  }
  return response.json();
};
