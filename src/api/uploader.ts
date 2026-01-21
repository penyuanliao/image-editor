import axios, { type AxiosError, type AxiosProgressEvent, type AxiosResponse } from "axios";
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
  onUploadProgress?: Function
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

  const response: AxiosResponse | null = await axios
    .post(`${metaData?.url || "/offer/uploadimg"}`, formData, {
      headers: {
        accept: "application/json, text/plain, */*",
        bambi: "N",
        "bambi-log": "Y",
        "cache-control": "no-cache",
        pragma: "no-cache"
      },
      onUploadProgress: (progressEvent:AxiosProgressEvent) => {
        if (onUploadProgress) onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total!));
      }
    })
    .catch((error: AxiosError) => {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        ElMessage({
          message: `連線錯誤:无法连接伺服器，可能是跨域 (CORS) 限制或网路中断(${error.code})。`,
          type: "error",
          duration: 10000,
        });
      } else {
        ElMessage({
          message: `未知錯誤:${error.message}(${error.code})`,
          type: "error",
          duration: 10000,
        });
      }
      return null;
    });
  if (response?.status === 200) {
    // 成功？
    return response.data;
  } else {
    return null;
  }
};
