import { ElMessage } from "element-plus";

export interface UploadImageResult {
  status: "Y" | "N";
  code: string;
  data: {
    size: number;
    link: string; // //cdn.vir999.net/tpl/copy/6/1766738868238.png
    path: string; // /tpl/copy/6/1766738868238.png
  };
  message: string; // 失敗字串
}
export interface UploadImageMetaData {
  hallId?: string;
  width?: string;
  height?: string;
  bytes?: string;
  url?: string;
}

//PD上傳圖片採用FormData格式
export const uploadImage = async (
  fileName: string,
  image: Blob,
  metaData?: UploadImageMetaData,
): Promise<UploadImageResult | null> => {
  const formData = new FormData();
  // 根據你的原始字串，後端接收的 key 是 "file" 而不是 "imageFile"
  formData.append("file", image, fileName);

  // 補上其他欄位
  if (metaData) {
    if (metaData.hallId) formData.append("hallId", metaData.hallId);
    if (metaData.width) formData.append("width", metaData.width);
    if (metaData.height) formData.append("height", metaData.height);
    // 如果 metaData 有傳 bytes 就用傳的，否則使用 image.size (檔案大小) 自動帶入
    formData.append("bytes", metaData.bytes || image.size.toString());
  }

  try {
    // 注意: fetch API 原生不支援上傳進度 (onUploadProgress)，若需此功能請改用 XMLHttpRequest
    const response = await fetch(`${metaData?.url || "/offer/uploadimg"}`, {
      method: "POST",
      body: formData
    });

    if (response.status === 200) {
      return (await response.json()) as UploadImageResult;
    } else {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error: any) {
    const isNetworkError = error.message === "Failed to fetch" || error.message.includes("NetworkError");
    if (isNetworkError) {
      ElMessage({
        message: `連線錯誤:无法连接伺服器，可能是跨域 (CORS) 限制或网路中断。`,
        type: "error",
        duration: 10000
      });
    } else {
      ElMessage({
        message: `未知錯誤:${error.message}`,
        type: "error",
        duration: 10000
      });
    }
    return null;
  }
};
