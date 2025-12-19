import { API_ENDPOINTS } from "./endpoints";

export interface LoginResponseResult {
  status: boolean;
  message?: string;
  data: UserInfo;
  error?: string;
}
export interface UserInfo {
  user: string;
  token: string;
}

// 3. 建立一個專門用來擷取資料的函式
export const apiLogin = async (data: {
  sid: string;
  code: string;
  user: string;
}): Promise<LoginResponseResult> => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Login");
  }
  return response.json();
};
