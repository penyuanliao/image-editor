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
        pngImage.alt = "PNG image from clipboard";
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
export const processUrlToBase64 = (url: string) => {
    return new Promise<{ image: HTMLImageElement, base64: string }>(async (resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {

            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get 2D context");
            // 畫上圖片
            ctx.drawImage(image, 0, 0);
            // 轉成 base64
            const base64 = canvas.toDataURL("image/png"); // 或 "image/jpeg"
            resolve({
                base64,
                image
            });
        };
        image.src = url;
    });
}