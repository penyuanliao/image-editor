import {processUrl} from "./FileProcessor.ts";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig, type ISVGConfig, type ITextConfig} from "../types.ts";
// 產生一個新的 CanvasElement
export const createCanvasElement = (element: ICanvasElement, canvas: { width: number, height: number }, scale: number = 1) => {
    return new Promise<ICanvasElement>(async (resolve) => {
        console.log(element);
        if (element.type === ElementTypesEnum.Text) {
            const config = element.config as ITextConfig;
            resolve({
                id: Date.now(),
                type: ElementTypesEnum.Text,
                name: element.name || '新文字',
                config: {
                    content: config.content || '新文字',
                    x: canvas.width / 2,  // 預設放在畫布中央
                    y: canvas.height / 2,
                    fontSize: config.fontSize || 32,
                    fontFamily: config.fontFamily || 'Arial',
                    color: config.color || 'black',
                    fontWeight: config.fontWeight || 'normal',
                    lineHeight: config.lineHeight || 1.2,
                    shadowColor: config.shadowColor,
                    shadowBlur: config.shadowBlur,
                    shadowOffsetX: config.shadowOffsetX,
                    shadowOffsetY: config.shadowOffsetY,
                    strokeColor: config.strokeColor,
                    strokeWidth: config.strokeWidth,
                    rotation: 0,
                    gradientEnabled: config.gradientEnabled,
                    gradientStartColor: config.gradientStartColor,
                    gradientEndColor: config.gradientEndColor,
                    gradientAngle: config.gradientAngle,
                } as ITextConfig
            });
        } else if (element.type === ElementTypesEnum.SVG) {
            const config: ISVGConfig = element.config as ISVGConfig;
            resolve({
                id: Date.now(),
                type: element.type,
                name: element.name || '新貼圖',
                config: {
                    content: config.content || '',
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    width: 50,
                    height: 50,
                    color: 'black',
                }
            });
        } else if (element.type === ElementTypesEnum.Image) {
            const config: IImageConfig = element.config;
            let img: HTMLImageElement;
            if (config.img) {
                img = config.img;
            } else {
                img = await processUrl(config.url || '');
            }
            resolve({
                id: Date.now(),
                type: ElementTypesEnum.Image,
                name: element.name || '新貼圖',
                config: {
                    url: img.src,
                    img,
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    width: img.naturalWidth * scale,
                    height: img.naturalHeight * scale,
                    rotation: 0,
                }
            });
        }
    })
};