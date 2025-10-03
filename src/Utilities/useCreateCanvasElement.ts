import type {CanvasElement} from "./useImageEditor.ts";
// 產生一個新的 CanvasElement
export const createCanvasElement = (element: any, canvas: { width: number, height: number }) => {
    return new Promise<CanvasElement>((resolve, reject) => {
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
            const img = new Image();
            img.onload = () => {
                if (!canvas) return reject('canvas is undefined');
                const MAX_DIMENSION = 150;
                const ratio = img.naturalWidth / img.naturalHeight;
                let width, height;
                if (ratio > 1) {
                    width = MAX_DIMENSION;
                    height = MAX_DIMENSION / ratio;
                } else {
                    height = MAX_DIMENSION;
                    width = MAX_DIMENSION * ratio;
                }
                resolve({
                    id: Date.now(),
                    type: 'sticker',
                    name: element.name || '新貼圖',
                    content: element.payload,
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    width: width,
                    height: height,
                    img: img,
                    rotation: 0,
                } as CanvasElement);
            };
            img.src = element.payload;
        }
    })
};