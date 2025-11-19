import {ElementTypesEnum, type ICanvasElement, type IImageConfig} from "@/types.ts";

/**
 * 對 ICanvasElement 陣列進行深拷貝，並特殊處理 HTMLImageElement。
 * @param elements 要拷貝的元素陣列。
 * @returns 深拷貝後的元素陣列。
 */
export function deepCloneElements(elements: ICanvasElement[]): ICanvasElement[] {
    // 1. 建立一個 "可序列化" 的版本，將 HTMLImageElement 暫時移除
    const serializableElements = elements.map(el => {
        if (el.type === ElementTypesEnum.Image) {
            // 複製 config 物件，但排除 'img' 屬性
            const { img, ...restConfig } = el.config as IImageConfig;
            return {
                ...el,
                config: restConfig,
            };
        }
        return el;
    });

    // 2. 對可序列化的版本進行深拷貝，這一步將會成功
    const clonedElements = structuredClone(serializableElements);

    // 3. 遍歷原始陣列和複製後的陣列，手動將 HTMLImageElement 的參考還原回去
    for (let i = 0; i < elements.length; i++) {
        const originalElement = elements[i];
        const clonedElement = clonedElements[i];

        if (originalElement?.type === ElementTypesEnum.Image && 'img' in originalElement.config) {
            (clonedElement?.config as IImageConfig).img = (originalElement.config as IImageConfig).img;
        }
    }

    return clonedElements;
}