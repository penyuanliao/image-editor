import type { ImagesStore } from '../store/images';
import {
    drawBackground,
    drawSticker,
    drawSVG,
    drawText,
    type StickerElement
} from './useImageEditor';
import { ErrorMessage } from "./AlertMessage.ts";

interface ExportOptions {
    store: ImagesStore;
    editorCanvas: HTMLCanvasElement;
}

export interface CroppedExportOptions extends ExportOptions {
    cropBox: { x: number, y: number, width: number, height: number };
    scaleFactor: number;
}

/**
 * 匯出裁切框內的區域，並根據指定的放大倍率產生高解析度圖片。
 * @param options - 包含 store、編輯器畫布、裁切框和放大倍率的物件。
 * @returns {string | null} - 圖片的 Data URL，或在失敗時返回 null。
 */
export function exportCroppedArea(options: CroppedExportOptions): string | null {
    const { store, cropBox, scaleFactor } = options;

    if (!store.originalImage) {
        ErrorMessage('沒有圖片可供匯出。');
        return null;
    }

    // 1. 建立一個離線的、高解析度的 Canvas
    const exportCanvas = document.createElement('canvas');
    const { x: cropX, y: cropY, width: cropWidth, height: cropHeight } = cropBox;

    exportCanvas.width = cropWidth * scaleFactor;
    exportCanvas.height = cropHeight * scaleFactor;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
        ErrorMessage('無法建立匯出畫布。');
        return null;
    }

    // 2. 在高解析度畫布上重新繪製所有內容
    exportCtx.fillStyle = "#FFFFFF";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 繪製背景圖
    exportCtx.drawImage(
        store.originalImage,
        cropX * scaleFactor, // 直接使用傳入的放大倍率來回推原始座標
        cropY * scaleFactor,
        cropWidth * scaleFactor,
        cropHeight * scaleFactor,
        0, 0,
        exportCanvas.width,
        exportCanvas.height
    );

    // 繪製所有元素
    store.elements.forEach(element => {
        const scaledElement = JSON.parse(JSON.stringify(element));
        scaledElement.x = (element.x - cropX) * scaleFactor;
        scaledElement.y = (element.y - cropY) * scaleFactor;

        if (scaledElement.type === 'sticker') {
            (scaledElement as StickerElement).width *= scaleFactor;
            (scaledElement as StickerElement).height *= scaleFactor;
            const originalElement = store.elements.find(e => e.id === element.id);
            if (originalElement && (originalElement as StickerElement).img) {
                scaledElement.img = (originalElement as StickerElement).img;
                drawSticker(exportCtx, scaledElement);
            }
        } else if (scaledElement.type === 'text') {
            if (scaledElement.fontSize) {
                scaledElement.fontSize *= scaleFactor;
            }
            drawText(exportCtx, scaledElement);
        } else if (scaledElement.type === 'icon') {
            if (scaledElement.size) {
                scaledElement.size *= scaleFactor;
            }
            drawSVG(exportCtx, scaledElement);
        }
    });

    return exportCanvas.toDataURL('image/png');
}

/**
 * 匯出包含所有元素的完整原始尺寸圖片。
 * @param options - 包含 store 和編輯器畫布的物件。
 * @returns {string | null} - 圖片的 Data URL，或在失敗時返回 null。
 */
export function exportFullResolution(options: ExportOptions): string | null {
    const { store, editorCanvas } = options;

    if (!store.originalImage) {
        ErrorMessage('沒有原始圖片可供匯出。');
        return null;
    }

    const exportCanvas = document.createElement('canvas');
    const targetWidth = store.originalImage.naturalWidth;
    const targetHeight = store.originalImage.naturalHeight;
    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return null;

    const scaleX = targetWidth / editorCanvas.width;
    const scaleY = targetHeight / editorCanvas.height;

    exportCtx.fillStyle = "#FFFFFF";
    exportCtx.fillRect(0, 0, targetWidth, targetHeight);
    drawBackground(exportCanvas, exportCtx, store.originalImage);

    store.elements.forEach(element => {
        const scaledElement = JSON.parse(JSON.stringify(element));
        scaledElement.x *= scaleX;
        scaledElement.y *= scaleY;

        if (scaledElement.type === 'sticker') {
            (scaledElement as StickerElement).width *= scaleX;
            (scaledElement as StickerElement).height *= scaleY;
            const originalElement = store.elements.find(e => e.id === element.id);
            if (originalElement && (originalElement as StickerElement).img) {
                scaledElement.img = (originalElement as StickerElement).img;
                drawSticker(exportCtx, scaledElement);
            }
        } else if (scaledElement.type === 'text') {
            if (scaledElement.fontSize) {
                scaledElement.fontSize *= scaleY;
            }
            drawText(exportCtx, scaledElement);
        } else if (scaledElement.type === 'icon') {
            if (scaledElement.size) {
                scaledElement.size *= scaleY;
            }
            drawSVG(exportCtx, scaledElement);
        }
    });

    return exportCanvas.toDataURL('image/png');
}