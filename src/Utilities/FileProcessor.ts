import { ErrorMessage } from "./AlertMessage.ts";
import type { IUploadedImage } from "@/types.ts";
// 處理選擇或拖曳的檔案
export const processFile = (file: File) => {

    return new Promise<IUploadedImage>((resolve, reject) => {
        // 驗證是否為圖片檔案
        if (!file.type.startsWith('image/')) {
            ErrorMessage('請上傳圖片檔案');
            reject('Invalid file type')
            return;
        }
        // 使用 FileReader 讀取檔案並產生預覽
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
                resolve({
                    imageUrl: dataUrl, // 用於切換 v-if 顯示
                    image: img, // 儲存圖片物件
                    name: file.name, // 用於顯示檔案名稱
                    base64: e.target?.result as string,
                    file
                });
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    })
}
export const processBlob = (blob: Blob) => {
    return new Promise<HTMLImageElement>(async (resolve) => {
        const pngImage = new Image();
        pngImage.onload = () => {
            resolve(pngImage);
        };
        pngImage.src = URL.createObjectURL(blob);
    });
}
export const processUrl = (url: string) => {
    return new Promise<HTMLImageElement>(async (resolve) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.src = url;
    });
}
const blobToBase64 = (blob: Blob) => {
    return new Promise<string>(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string); // 這裡會得到 base64 字串（含 data:... 前綴）
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
export const processUrlToBase64 = async (url: string) => {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`下載圖片失敗: ${response.status}`);
    }
    const blob = await response.blob();

    const base64 = await blobToBase64(blob);

    return {
        image: await processBlob(blob),
        base64: base64,
        blob: blob
    }
}
