import { defineStore } from "pinia";
import { ref } from "vue";

export interface KonvaShadowProps {
    shadowEnabled?: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
}

export interface KonvaStrokeProps {
    enabled?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
}

export interface KonvaTextGradientProps {
    fillPriority?: 'linear-gradient' | string;
    fillLinearGradientStartPoint?: {
        x: number;
        y: number;
    };
    fillLinearGradientEndPoint?: {
        x: number;
        y: number;
    };
    fillLinearGradientColorStops?: [number, string, number, string];
}

export interface KonvaTextProps extends KonvaShadowProps, KonvaTextGradientProps, KonvaStrokeProps {
    text: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'italic' | 'bold' | string;
    // 旋轉角度 (radians)
    rotation?: number;
}
export interface KonvaImageProps extends KonvaShadowProps, KonvaStrokeProps {
    x: number;
    y: number;
    width?: number;
    height?: number;
    // 旋轉角度 (radians)
    rotation?: number;
    image?: HTMLImageElement | null;
}

export interface KonvaTextConfig extends KonvaTextProps {
    draggable: boolean; // 是否可以拖拉
    name: string; // 收尋檢查用名稱
}
export interface KonvaImageConfig extends KonvaImageProps {
    draggable: boolean; // 是否可以拖拉
    name: string; // 收尋檢查用名稱
}

export interface KElementImage {
    type: 'image';
    id: string;
    config: KonvaImageConfig;
}
export interface KElementText {
    type: 'text';
    id: string;
    config: KonvaTextConfig;
}

export const useKImgEditorStore = defineStore('kImgEditorStore', () => {
    // 圖片陣列
    const imageList = ref<HTMLImageElement[]>([]);
    // 物件陣列
    const elements = ref<Array<KElementImage | KElementText>>([]);
    // 背景圖片
    const backgroundImage = ref<HTMLImageElement | null>(null);


    const addElement = (el: KElementImage | KElementText) => {
        elements.value.push(el);
    }
    const addImage = (image: HTMLImageElement) => {
        if (image) imageList.value.push(image);
    }

    return {
        elements, imageList, backgroundImage, addElement, addImage
    }
});