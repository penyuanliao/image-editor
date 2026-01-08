import axios, {type AxiosError, type AxiosResponse} from "axios";
import {ErrorMessage} from "@/Utilities/AlertMessage.ts";

export interface PDUploadImg {
    status: "Y" | "N";
    code: string;
    data: {
        size: number;
        link: string; // //cdn.vir999.net/tpl/copy/6/1766738868238.png
        path: string; // /tpl/copy/6/1766738868238.png
    };
    message: string; // 失敗字串
}

//PD上傳圖片採用FormData格式
export const uploadImage = async (fileName: string, image: Blob, metaData?: { hallId?: string, width?: string, height?: string, bytes?: string, url?: string }) => {
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

    const response: AxiosResponse | null = await axios.post(`${metaData?.url || ""}/offer/uploadimg`, formData, {
        headers: {
            "accept": "application/json, text/plain, */*",
            "bambi": "N",
            "bambi-log": "Y",
            "cache-control": "no-cache",
            "pragma": "no-cache"
        }
    }).catch((error: AxiosError) => {
        ErrorMessage(error.message);
        return null;
    });
    if (response?.status === 200) {
        // 成功？
        return response.data;
    } else {
        return null;
    }
}