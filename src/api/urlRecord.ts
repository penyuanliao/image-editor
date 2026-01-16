import { API_ENDPOINTS } from "./endpoints";

export interface UrlRecordResponseResult {
  status: boolean;
  message?: string;
  error?: string;
}

// 3. 建立一個專門用來擷取資料的函式
export const apiUrlRecord = async (data: {
  url: string
}): Promise<UrlRecordResponseResult> => {
  const response = await fetch(API_ENDPOINTS.URL_RECORD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to fetch URL Record");
  }
  return response.json();
};
