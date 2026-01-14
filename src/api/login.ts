import { API_ENDPOINTS } from "./endpoints";

export interface LoginResponseResult {
  status: boolean;
  message?: string;
  data: UserInfo;
  error?: string;
}
export interface UserInfo {
  user: string;
  authorization: string;
  marqueeText: string;
}

// 3. 建立一個專門用來擷取資料的函式
export const apiLogin = async (data: {
  token: string;
  username: string;
  logincode: string;
  env: string;
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
