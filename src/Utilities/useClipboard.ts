import { generalDefaults } from "@/config/settings.ts";

export interface ClipboardList {
  type: string;
  value: string | HTMLImageElement | null;
}

export const clipboardPaste = async (): Promise<{
  texts: string[];
  images: { image: HTMLImageElement; base64: string, size: number; }[];
}> => {
  const content: ClipboardItems = await navigator.clipboard.read();
  const texts: string[] = [];
  const images: { image: HTMLImageElement; base64: string, size: number }[] = [];
  for (let i = 0; i < content.length; i++) {
    let item: ClipboardItem = content[i] as ClipboardItem;
    if (item.types.includes("text/plain")) {
      let blob = await item.getType("text/plain");
      texts.push(await blob.text());
    } else if (item.types.every((type) => generalDefaults.allowedExtensions.includes(type))) {
      const png = item.types.includes("image/png");
      const blob = await item.getType(png ? "image/png" : "image/jpeg");
      const image = await loadImage(blob);
      const base64 = await blobToBase64(blob);
      const size = blob.size;
      if (image)
        images.push({
          image,
          base64,
          size
        });
    }
  }
  return { texts, images };
};
export const pasteImage = async (): Promise<HTMLImageElement | null> => {
  let content: ClipboardItems = await navigator.clipboard.read();
  for (let i = 0; i < content.length; i++) {
    let item: ClipboardItem = content[i] as ClipboardItem;
    if (item.types.includes("image/png")) {
      const blob = await item.getType("image/png");
      return await loadImage(blob);
    }
  }
  return null;
};
export const loadImage = async (blob: Blob): Promise<HTMLImageElement | null> => {
  return new Promise(async (resolve) => {
    const pngImage = new Image();
    pngImage.alt = "PNG image from clipboard";
    pngImage.onload = () => {
      resolve(pngImage);
    };
    pngImage.src = URL.createObjectURL(blob);
  });
};

/**
 * 將 Blob 物件轉換為 Base64 data URL。
 * @param blob - 要轉換的 Blob 物件。
 * @returns {Promise<string>} - 一個解析為 Base64 data URL 字串的 Promise。
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result 包含 data URL (例如 "data:image/png;base64,iVBORw0KGgo...")
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to Base64 string."));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};

export const validationPermissions = async () => {
  try {
    // 檢查剪貼簿讀取權限
    const permission = await navigator.permissions.query({
      name: "clipboard-read" as PermissionName
    });
    if (permission.state === "denied") {
      console.error("剪貼簿讀取權限已被拒絕。");
      alert("您已拒絕剪貼簿讀取權限，請至瀏覽器設定中重新開啟。");
      return false;
    }
    return true;
  } catch (e) {
    console.error("讀取剪貼簿時發生錯誤:", e);
    return false;
  }
};
