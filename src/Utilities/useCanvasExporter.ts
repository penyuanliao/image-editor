import type { EditorStore } from "../store/editorStore.ts";
import { drawImage, drawSVG, drawText } from "./useImageEditor";
import { ErrorMessage } from "./AlertMessage.ts";
import {
  ElementTypesEnum,
  type IImageConfig,
  type ISVGConfig,
  type ITextConfig
} from "../types.ts";

interface ExportOptions {
  store: EditorStore;
  editorCanvas: HTMLCanvasElement;
}

export interface CroppedExportOptions extends ExportOptions {
  cropBox: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  type?: "image/jpeg" | "image/png";
  color?: string;
}

/**
 * 匯出裁切框內的區域，並根據指定的放大倍率產生高解析度圖片。
 * @param options - 包含 store、編輯器畫布、裁切框和放大倍率的物件。
 * @returns {string | null} - 圖片的 Data URL，或在失敗時返回 null。
 */
export function exportCroppedArea(options: CroppedExportOptions): string | null {
  const { store, cropBox, scaleFactor } = options;
  // 1. 建立一個離線的、高解析度的 Canvas
  const exportCanvas = document.createElement("canvas");
  const { x: cropX, y: cropY, width: cropWidth, height: cropHeight } = cropBox;

  exportCanvas.width = cropWidth * scaleFactor;
  exportCanvas.height = cropHeight * scaleFactor;

  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) {
    ErrorMessage("無法建立匯出畫布。");
    return null;
  }

  // 2. 在高解析度畫布上重新繪製所有內容
  exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
  // 1. 清除畫布
  exportCtx.fillStyle = options.color || "transparent";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // 繪製背景圖
  if (store.originalImage) {
    exportCtx.drawImage(
      store.originalImage, // 來源圖片
      cropX, // 來源圖片的裁切 X 點 (世界座標)
      cropY, // 來源圖片的裁切 Y 點 (世界座標)
      cropWidth, // 來源圖片的裁切寬度 (世界座標)
      cropHeight, // 來源圖片的裁切高度 (世界座標)
      0,
      0, // 在目標畫布上的繪製位置 (0,0)
      exportCanvas.width,
      exportCanvas.height
    );
  }

  // 繪製所有元素
  store.elements.forEach((element) => {
    const config = element.config;

    // 建立一個新的元素物件用於繪製，避免修改原始 store 中的資料
    const elementForExport = {
      ...element,
      config: {
        ...config,
        // 將元素的世界座標轉換為相對於裁切框的座標，然後放大
        x: (config.x - cropX) * scaleFactor,
        y: (config.y - cropY) * scaleFactor
      }
    };

    if (element.type === ElementTypesEnum.Image) {
      const imageConfig = elementForExport.config as IImageConfig;
      imageConfig.width *= scaleFactor;
      imageConfig.height *= scaleFactor;
      // 確保 img 物件被正確傳遞
      imageConfig.img = (element.config as IImageConfig).img;
      drawImage(exportCtx, elementForExport);
    } else if (element.type === ElementTypesEnum.Text) {
      const fontSize: number = (elementForExport.config as ITextConfig).fontSize || 1;
      (elementForExport.config as ITextConfig).fontSize = fontSize * scaleFactor;
      drawText(exportCtx, elementForExport);
    } else if (element.type === ElementTypesEnum.SVG) {
      (elementForExport.config as ISVGConfig).width *= scaleFactor;
      (elementForExport.config as ISVGConfig).height *= scaleFactor;
      drawSVG(exportCtx, elementForExport);
    }
  });

  return exportCanvas.toDataURL(options.type || "image/png");
}
