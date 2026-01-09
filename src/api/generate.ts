/**
 * @file API endpoints, types, and functions for materials.
 */
import { API_ENDPOINTS } from "./endpoints";

export interface ImageGenerateResult {
  status: boolean;
  error?: string;
  image: string;
}
// originalimage, materialid, originalurl 三則一
export interface AIGenRequest {
  originalimage?: string;
  materialid?: number;
  materialurl?: string; // choice = 0 有 materialid
  originalurl?: string;
  prompt?: string;
  choice?: number;
  color?: string; // 處理顏色
  mask?: boolean; // 處理去背
}

// 3. 建立一個專門用來擷取資料的函式
export const apiImageGenerate = async (
  body: string,
  options?: { authorization?: string }
): Promise<ImageGenerateResult> => {
  const response = await fetch(API_ENDPOINTS.IMAGE_GENERATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: options?.authorization || ""
    },
    body
  });
  if (!response.ok) {
    throw new Error("Failed to fetch image generate.");
  }
  return response.json();
};
