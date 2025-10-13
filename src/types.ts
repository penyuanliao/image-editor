export interface TextElement {
  type: "text";
  name?: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: 'normal' | 'bold';
  lineHeight?: number; // As a multiplier of font size, e.g., 1.2
  rotation?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  strokeColor?: string;
  strokeWidth?: number;
  gradientEnabled?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientAngle?: number;
}
export interface StickerElement {
    type: 'sticker',
    payload?: string;
    img?: HTMLImageElement;
    name?: string;
}

export type ImageEditorElement = TextElement; // Add other element types here in the future

export interface ImageEditorAction {
    type: "icon" | "text" | "sticker" | "image";
    content?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    lineHeight?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    strokeColor?: string;
    strokeWidth?: number;
    payload?: string;
    gradientEnabled?: boolean;
    gradientStartColor?: string;
    gradientEndColor?: string;
    gradientAngle?: number;
}

export const ImageEditorTypes: {
    [key: string]: string
} = {
    star: 'ai',
    image: 'image',
    text: 'text',
    sticker: 'sticker',
    'upload': 'upload',
    layers: 'layers'
}
