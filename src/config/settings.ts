import { BoxBarTypes } from "@/types.ts";

export interface IZoomControlVisible {
  slider: boolean;
  decreaseIncrease: boolean;
}

export interface IGeneralSettings {
  viewport: {
    width: number;
    height: number;
    color: string;
    maxWidth: number;
    maxHeight: number;
  };
  // 支援的圖片格式
  allowedExtensions: string[];
  // 還原步驟最大值
  maxUndoOperations: number;
  // 意見回饋最大字數限制
  maxCommentLength: number;
  // 縮放範圍
  zoomLimits: {
    max: number;
    min: number;
    perUnit: number;
  };
  // 放大縮小按鈕模式
  zoomControlVisible: IZoomControlVisible
  // 網底
  gridBackground: "blackAndWhite" | "white" | "none";
  // 最近使用過素材最大值
  maxRecentFiles: number;
  logo: string;
  // 幫助
  helpUrl: string;
}

export interface IAdvancedSettings {
  // 啟用: 快捷鍵選單
  popupMenu: boolean;
  // 啟用: 圖片剪裁功能
  imageCropEditEnabled: boolean;
  // 啟用: 對齊功能
  alignEnabled: boolean;
  // 啟用: Ctrl + Wheel縮放Canvas
  zoomEnabled: boolean;
  // 啟用: Ctrl+Z
  undoRedoEnabled: boolean;
  // 啟用: 側邊長方形控制寬或高
  eachSideHandlesEnabled: boolean;
  // 啟用: 對角線拉伸
  pivotPointEnabled: boolean;
  // 啟用: 元件增加Hovered
  hoveredEnabled: boolean;
  // 啟用: 多選文字顏色
  textMultiColorEnabled: boolean;
}

export const generalDefaults: IGeneralSettings = {
  viewport: {
    width: 550,
    height: 240,
    color: "transparent",
    maxWidth: 800,
    maxHeight: 600
  },
  allowedExtensions: ["image/png", "image/jpeg", "image/webp"],
  maxUndoOperations: 20,
  maxCommentLength: 500,
  zoomLimits: {
    max: 5,
    min: 0.1,
    perUnit: 0.1
  },
  zoomControlVisible: {
    slider: true,
    decreaseIncrease: false
  },
  gridBackground: "none",
  maxRecentFiles: 20,
  logo: "/assets/icons/logo.png",
  helpUrl: "/assets-editor/#/help"
};

export const appearanceDefaults = {
  artStyle: [
    { name: "3D插画", value: 1, key: "Illustration Style", url: "./assets/themes/img_3d.png" },
    {
      name: "赛博庞克",
      value: 2,
      key: "cyberpunk",
      url: "./assets/themes/img_cyberpunk.png"
    },
    { name: "塗鴉藝術", value: 3, key: "Graffiti", url: "./assets/themes/img_oil_painting.png" }
  ],
  reimagine: [
    { name: "3D插画", value: 11, key: "Illustration Style", url: "./assets/themes/img_3d.png" },
    {
      name: "赛博庞克",
      value: 12,
      key: "cyberpunk",
      url: "./assets/themes/img_cyberpunk.png"
    },
    { name: "塗鴉藝術", value: 13, key: "Graffiti", url: "./assets/themes/img_oil_painting.png" }
  ],
  StandardStageSizes: [
    {
      title: "指定尺寸",
      content: "550 x 550 像素", // 1
      value: { width: 550, height: 550 }
    },
    {
      title: "指定尺寸",
      content: "550 x 240 像素", // 2
      value: { width: 550, height: 240 }
    },
    {
      title: "指定尺寸",
      content: "550 x 180 像素", // 3
      value: { width: 550, height: 180 }
    },
    {
      title: "指定尺寸",
      content: "1120 x 180 像素", // 4
      value: { width: 1120, height: 180 }
    },
    {
      title: "指定尺寸",
      content: "640 x 196 像素", // 5
      value: { width: 640, height: 196 }
    },
    {
      title: "指定尺寸",
      content: "1120 x 300 像素", // 6
      value: { width: 1120, height: 300 }
    },
    {
      title: "指定尺寸",
      content: "550 x 300 像素", // 7
      value: { width: 550, height: 300 }
    },
    {
      title: "指定尺寸",
      content: "1120 x 240 像素", // 8
      value: { width: 1120, height: 240 }
    },
    {
      title: "指定尺寸",
      content: "310 x 196 像素", // 9
      value: { width: 310, height: 196 }
    },
    {
      title: "指定尺寸",
      content: "640 x 300 像素", // 10
      value: { width: 640, height: 300 }
    },
    {
      title: "指定尺寸",
      content: "1120 x 1120 像素", // 11
      value: { width: 1120, height: 1120 }
    },
    {
      title: "指定尺寸",
      content: "640 x 240 像素", // 12
      value: { width: 640, height: 240 }
    },
    {
      title: "指定尺寸",
      content: "360 x 240 像素", // 13
      value: { width: 360, height: 240 }
    },
    {
      title: "指定尺寸",
      content: "310 x 240 像素", // 14
      value: { width: 310, height: 240 }
    },
    {
      title: "指定尺寸",
      content: "360 x 300 像素", // 15
      value: { width: 360, height: 300 }
    }
  ],
  boxBarSelected: BoxBarTypes.image,
};

export const advancedDefaults: IAdvancedSettings = {
  popupMenu: true,
  imageCropEditEnabled: false,
  alignEnabled: false,
  zoomEnabled: true,
  undoRedoEnabled: false,
  eachSideHandlesEnabled: true,
  pivotPointEnabled: true,
  hoveredEnabled: false,
  textMultiColorEnabled: false,
};
