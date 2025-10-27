import type { ImagesStore } from '../store/images';
import {
    drawSticker,
    drawSVG,
    drawText,
} from './useImageEditor';
import { ErrorMessage } from "./AlertMessage.ts";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig} from "../types.ts";

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
    console.log(options);
    if (!store.originalImage) {
        // ErrorMessage('沒有圖片可供匯出。');
        // return null;
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
    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    // 1. 清除畫布
    exportCtx.fillStyle = "transparent";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 繪製背景圖
    if (store.originalImage) {
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
    }

    // 繪製所有元素
    store.elements.forEach(element => {
        const config = element.config;
        const scaledElement = JSON.parse(JSON.stringify(config));
        scaledElement.x = (config.x - cropX) * scaleFactor;
        scaledElement.y = (config.y - cropY) * scaleFactor;

        if (scaledElement.type === ElementTypesEnum.Image) {
            scaledElement.width *= scaleFactor;
            scaledElement.height *= scaleFactor;
            const originalElement = store.elements.find(e => e.id === element.id);
            if (originalElement && (originalElement.config as IImageConfig).img) {
                scaledElement.img = (originalElement.config as IImageConfig).img;
                drawSticker(exportCtx, scaledElement);
            }
        } else if (scaledElement.type === ElementTypesEnum.Text) {
            if (scaledElement.fontSize) {
                scaledElement.fontSize *= scaleFactor;
            }
            drawText(exportCtx, scaledElement);
        } else if (scaledElement.type === ElementTypesEnum.SVG) {
            scaledElement.width *= scaleFactor;
            scaledElement.height *= scaleFactor;
            drawSVG(exportCtx, scaledElement);
        }
    });

    return exportCanvas.toDataURL('image/png');
}