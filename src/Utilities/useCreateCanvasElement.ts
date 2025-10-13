import type {CanvasElement} from "./useImageEditor.ts";
import {processUrl} from "./FileProcessor.ts";
// 產生一個新的 CanvasElement
export const createCanvasElement = (element: any, canvas: { width: number, height: number }, scale: number = 1) => {
    return new Promise<CanvasElement>(async (resolve) => {
        if (element.type === 'text') {
            resolve({
                id: Date.now(),
                type: 'text',
                name: element.name || '新文字',
                content: element.content || '新文字',
                x: canvas.width / 2,  // 預設放在畫布中央
                y: canvas.height / 2,
                fontSize: element.fontSize || 32,
                fontFamily: element.fontFamily || 'Arial',
                color: element.color || 'black',
                fontWeight: element.fontWeight || 'normal',
                lineHeight: element.lineHeight || 1.2,
                shadowColor: element.shadowColor,
                shadowBlur: element.shadowBlur,
                shadowOffsetX: element.shadowOffsetX,
                shadowOffsetY: element.shadowOffsetY,
                strokeColor: element.strokeColor,
                strokeWidth: element.strokeWidth,
                rotation: 0,
                gradientEnabled: element.gradientEnabled,
                gradientStartColor: element.gradientStartColor,
                gradientEndColor: element.gradientEndColor,
                gradientAngle: element.gradientAngle,
            } as CanvasElement);
        } else if (element.type === 'icon') {
            resolve({
                id: Date.now(),
                type: 'icon',
                name: element.name || '新貼圖',
                content: element.content || '',
                x: canvas.width / 2,
                y: canvas.height / 2,
                size: 50,
                color: 'black',
            } as CanvasElement);
        } else if (element.type === 'sticker') {
            console.log('element', element);
            let img: HTMLImageElement;
            if (element.img) {
                img = element.img;
            } else {
                img = await processUrl(element.payload);
            }
            resolve({
                id: Date.now(),
                type: 'sticker',
                name: element.name || '新貼圖',
                content: element.img ? element.img.src : element.payload,
                x: canvas.width / 2,
                y: canvas.height / 2,
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale,
                img: img,
                rotation: 0,
            } as CanvasElement);
        }
    })
};