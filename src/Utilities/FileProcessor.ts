import { ErrorMessage } from "./AlertMessage.ts";
import type { IUploadedImage } from "@/types.ts";
import { generalDefaults } from "@/config/settings.ts";
// 處理選擇或拖曳的檔案
export const processFile = (file: File) => {

    return new Promise<IUploadedImage>((resolve, reject) => {
        // 驗證是否為圖片檔案
        if (!generalDefaults.allowedExtensions.includes(file.type)) {
            ErrorMessage(`不支援的檔案格式。請上傳 ${generalDefaults.allowedExtensions.join(', ')} 格式的檔案。`);
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
        // Set crossOrigin to "Anonymous" BEFORE setting the src.
        // This requests the image with CORS headers, preventing the canvas from being tainted.
        // image.crossOrigin = "Anonymous";
        image.onload = () => {
            resolve(image);
        };
        image.src = url;
    });
}
export const processBase64 = (base64: string) => {
    return new Promise<HTMLImageElement>(async (resolve) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.src = `data:image/png;base64,${base64}`;
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

/**
 * Converts an HTMLImageElement to a Base64 data URL.
 * @param image The loaded image element to convert.
 * @param type The desired image format (e.g., 'image/png', 'image/jpeg').
 * @param quality For 'image/jpeg' or 'image/webp', a number between 0 and 1 for the image quality.
 * @returns The Base64 data URL string.
 */
export const imageToBase64 = (image: HTMLImageElement, type: string = 'image/png', quality?: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas 2d context');
    }

    ctx.drawImage(image, 0, 0);

    return canvas.toDataURL(type, quality);
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
