import {processUrl} from "./FileProcessor.ts";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig, type ISVGConfig, type ITextConfig} from "../types.ts";
import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";
import {nanoid} from "nanoid";
import {svgPathBbox} from "svg-path-bbox";
import type {CanvasEditor} from "@/Utilities/CanvasEditor.ts";
// 產生一個新的 CanvasElement
export const createCanvasElement = (element: ICanvasElement, canvas: { width: number, height: number }, editor: CanvasEditor) => {
    return new Promise<ICanvasElement>(async (resolve) => {
        if (element.type === ElementTypesEnum.Text) {
            const config = element.config as ITextConfig;
            resolve({
                id: nanoid(12),
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
            const width: number = (img?.naturalWidth || 1);
            const height: number = (img?.naturalHeight || 1);
            const info = calculateConstrainedSize(width, height, editor.artboardSize.width, editor.artboardSize.height);
            const shrink: number = 0.9;
            resolve({
                id: nanoid(12),
                type: ElementTypesEnum.Image,
                name: element.name || '新貼圖',
                config: {
                    url: config.url ? config.url : img?.src,
                    img: img,
                    base64,
                    id: config.id,
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    width: info.width * shrink,
                    height: info.height * shrink,
                    rotation: 0,
                    opacity: Math.min(Math.max(config.opacity || 1, 0), 1.0),
                    categoryId: config.categoryId,
                    draggable: true
                }
            });
        }
        else if (element.type === ElementTypesEnum.SVG) {
            const config: ISVGConfig = element.config as ISVGConfig;
            // 使用 svg-path-bbox 計算路徑的實際邊界
            const bbox = svgPathBbox(config.content); // 回傳 [x1, y1, x2, y2]
            const baseWidth = bbox[2] - bbox[0];
            const baseHeight = bbox[3] - bbox[1];
            // const info = calculateConstrainedSize(pathWidth, pathHeight, canvas.width, canvas.height);
            // const shrink: number = 0.9;
            console.log(`pathWidth: ${baseWidth} pathHeight: ${baseHeight}`);

            resolve({
                id: element.id || nanoid(12),
                type: element.type,
                name: element.name || '新貼圖',
                config: {
                    offsetX: bbox[0], // 儲存路徑的 X 偏移
                    offsetY: bbox[1], // 儲存路徑的 Y 偏移
                    content: config.content || '',
                    color: config.color,
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    baseWidth: baseWidth,
                    baseHeight: baseHeight,
                    width: baseWidth,
                    height: baseHeight,
                    opacity: Math.min(Math.max(config.opacity || 1, 0), 1.0),
                    aspectRatio: 1,
                    draggable: true
                }
            });
        }
    })
};
export const CreateImageElement = ({ name, image, imageUrl, base64 }: { name: string, image: HTMLImageElement, imageUrl: string, base64?: string }): ICanvasElement => {
    return {
        id: nanoid(12),
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