export const ElementTypesEnum = {
  Stage: "stage",
  Text: "text",
  Image: "image",
  Sticker: "image",
  SVG: "svg"
} as const;

export type ICanvasTypes = (typeof ElementTypesEnum)[keyof typeof ElementTypesEnum];

export interface IGRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICanvasElement {
  id: string;
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
  id?: number; // 產AI圖使用的ID
  categoryId?: number; // 產圖特例編號
  filter?: string; // 特效
}

export interface StageConfig extends AbsoluteConfig {
  width: number;
  height: number;
  color: string;
}

export interface IImageCropConfig {
  isCropping?: boolean; // 是否正在剪裁
  cropRect?: IGRect; // 剪裁區域 (相對於原始圖片)
}

export interface IImageConfig extends AbsoluteConfig {
  img?: HTMLImageElement;
  url?: string;
  width: number;
  height: number;
  base64?: string;
  radius?: number | number[]; // 圓角
  cropConfig?: IImageCropConfig; // 圖片剪裁設定
  imageGenMode?: number;
  materialId?: string;
  filename?: string; // GA使用
  origin?: string; // AI產圖完url會變成產圖的blob url
}

// 多顏色區塊的段落
export interface ITextSegment {
  text: string;
  color?: string;
  select?: boolean;
}

export interface ITextConfig extends AbsoluteConfig {
  content: string;
  segments?: ITextSegment[];
  color: string;
  fontFamily?: string;
  // 文字屬性
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fontItalic?: boolean;
  lineHeight?: number;
  // 文字對齊屬性
  textAlign?: "left" | "center" | "right";
  textBaseline?: "top" | "middle" | "bottom";

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
  gradientType?: "linear" | "radial" | string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientStops?: (string | number)[];
  gradientAngle?: number;

  // 文字間距
  letterSpacing: number;

  _lineSpacing?: number;
  _countLines?: number;
}

export interface ISVGConfig extends AbsoluteConfig {
  content: string;
  color: string;
  baseWidth: number;
  baseHeight: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  aspectRatio: number;
}

export interface IUploadedImage {
  imageUrl: string;
  image: HTMLImageElement;
  name: string;
  base64?: string;
  file?: File;
  imageGenMode?: number;
}

export const BoxBarTypes: {
  [key: string]: string;
} = {
  image: "image",
  text: "text",
  upload: "upload",
  layers: "layers",
  imageEdit: "imageEdit",
  textEdit: "textEdit",
  none: ""
};

export const AlignPositionEnum = {
  left: "left",
  center: "center",
  right: "right",
  top: "top",
  middle: "middle",
  bottom: "bottom"
};

export const ImageGenModeEnum = {
  NONE: 1,
  STYLE_MATTING: 2,
  STYLE_NOT_MATTING: 3,
  COLOR_MATTING: 4,
  COLOR_NOT_MATTING: 5,
  CUSTOM: 10
};
export type ImageGenMode = (typeof ImageGenModeEnum)[keyof typeof ImageGenModeEnum];