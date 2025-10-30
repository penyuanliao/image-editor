
export const ElementTypesEnum = {
    Stage: 'stage',
    Text: 'text',
    Image: 'image',
    Sticker: 'image',
    SVG: 'svg'
} as const;

export type ICanvasTypes = typeof ElementTypesEnum[keyof typeof ElementTypesEnum];

export interface ICanvasElement {
    id: number;
    type: ICanvasTypes;
    name?: string;
    config: IImageConfig | ITextConfig | ISVGConfig | StageConfig;
}

export interface AbsoluteConfig {
    name?: string;
    width?: number;
    height?: number;
    x: number;
    y: number;
    rotation?: number; // 旋轉角度 (radians)
    opacity?: number; // 透明度 (0-1)
    scaleX?: number;
    scaleY?: number;
    draggable?: boolean; // 是否可拖曳
}

export interface StageConfig extends AbsoluteConfig {
    width: number;
    height: number;
    color: string;
}

export interface IImageConfig extends AbsoluteConfig {
    img?: HTMLImageElement;
    url?: string;
    width: number;
    height: number;
}

export interface ITextConfig extends AbsoluteConfig {
    content: string;
    color: string;
    fontFamily?: string;
    // 文字屬性
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontItalic?: boolean;
    lineHeight?: number;
    // 文字對齊屬性
    textAlign?: CanvasTextAlign;

    // 陰影屬性
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;

    // 外框屬性
    strokeColor?: string;
    strokeWidth?: number;

    // 漸層屬性
    gradientEnabled?: boolean;
    gradientType?: 'linear' | 'radial' | string;
    gradientStartColor?: string;
    gradientEndColor?: string;
    gradientStops?: (string | number)[];
    gradientAngle?: number;

    // 文字間距
    letterSpacing: number;

}

export interface ISVGConfig extends AbsoluteConfig {
    content: string;
    color: string;
    width: number;
    height: number;
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
