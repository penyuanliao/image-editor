import {processUrl} from "./FileProcessor.ts";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig, type ISVGConfig, type ITextConfig} from "../types.ts";
// 產生一個新的 CanvasElement
export const createCanvasElement = (element: ICanvasElement, canvas: { width: number, height: number }, scale: number = 1) => {
    return new Promise<ICanvasElement>(async (resolve) => {
        if (element.type === ElementTypesEnum.Text) {
            const config = element.config as ITextConfig;
            resolve({
                id: Date.now(),
                type: ElementTypesEnum.Text,
                name: element.name || '新文字',
                config: {
                    content: config.content || '新文字',
                    segments: config.segments,
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
                    opacity: Math.min(Math.max(config.opacity || 0, 0), 1.0),
                    draggable: true
                } as ITextConfig
            });
        }
        else if (element.type === ElementTypesEnum.Image) {
            const config: IImageConfig = element.config as IImageConfig;
            let img: HTMLImageElement | undefined = undefined;
            let base64;
            if (config.img) {
                img = config.img;
                base64 = config.base64;
            } else if (config.url) {
                img = await processUrl(config.url);
                // base64 = imageToBase64(img, 'image/png');
            }

            resolve({
                id: Date.now(),
                type: ElementTypesEnum.Image,
                name: element.name || '新貼圖',
                config: {
                    url: config.url ? config.url : img?.src,
                    img: img,
                    base64,
                    id: config.id,
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    width: (img?.naturalWidth || 1) * scale,
                    height: (img?.naturalHeight || 1) * scale,
                    rotation: 0,
                    opacity: Math.min(Math.max(config.opacity || 1, 0), 1.0),
                    draggable: true
                }
            });
        }
        else if (element.type === ElementTypesEnum.SVG) {
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
                    opacity: Math.min(Math.max(config.opacity || 1, 0), 1.0),
                    draggable: true
                }
            });
        }
    })
};
export const CreateImageElement = ({ name, image, imageUrl, base64 }: { name: string, image: HTMLImageElement, imageUrl: string, base64?: string }): ICanvasElement => {
    return {
        id: Date.now(),
        name,
        type: ElementTypesEnum.Image,
        config: {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
            rotation: 0,
            opacity: 1,
            draggable: true,
            url: imageUrl,
            img: image,
            base64
        },
    }
};