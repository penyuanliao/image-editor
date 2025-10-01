import { ErrorMessage } from "./AlertMessage.ts";
// 處理選擇或拖曳的檔案
export const processFile = (file: File) => {

    return new Promise<{ imageUrl: string, image: HTMLImageElement, name: string }>((resolve, reject) => {
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
                    name: file.name // 用於顯示檔案名稱
                });
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    })
}