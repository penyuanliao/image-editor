import {BoxBarTypes} from "@/types.ts";

export interface IGeneralSettings {
    viewport: {
        width: number;
        height: number;
        color: string;
        maxWidth: number;
        maxHeight: number;
    },
    // 支援的圖片格式
    supportedImageFiles: string[];
    // 還原步驟最大值
    undoRedoStackMax: number;
    // 縮放範圍
    zoomLimits: {
        max: number;
        min: number;
    }
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
}

export const generalDefaults: IGeneralSettings = {
    viewport: {
        width: 550,
        height: 240,
        color: "transparent",
        maxWidth: 800,
        maxHeight: 600
    },
    supportedImageFiles: ["image/png", "image/jpeg"],
    undoRedoStackMax: 20,
    zoomLimits: {
        max: 2,
        min: 0.2
    }
};

export const appearanceDefaults = {
    AIStyles: [
        // { name: '自订', value: 0, key: 'custom', url: './assets/themes/img_custom.png' },
        { name: '3D插画', value: 1, key: 'Illustration Style', url: './assets/themes/img_3d.jpg' },
        { name: '吉卜力風格', value: 2, key: 'Ghibli Style', url: './assets/themes/img_cartoon.jpg' },
        { name: '动漫', value: 3, key: 'Anime Style', url: './assets/themes/img_anime.jpg' },
        { name: '赛博庞克', value: 4, key: 'cyberpunk', class: 'cyberpunk', url: './assets/themes/img_cyberpunk.jpg' },
        { name: '水彩畫', value: 5, key: 'watercolor', url: './assets/themes/img_watercolor.jpg' },
        { name: '塗鴉藝術', value: 6, key: 'Graffiti', url: './assets/themes/img_oil_painting.jpg' },
    ],
    colorMask: [
        { name: '藍色', value: 1, key: 'blue' },
        { name: '綠色', value: 2, key: 'green' },
        { name: '紅色', value: 3, key: 'red' },
        { name: '土色', value: 4, key: 'khaki' },
        { name: '黑色', value: 5, key: 'black' },
        { name: '紫色', value: 6, key: 'purple' },
    ],
    imagine: [
        { name: '3D插画', value: 21, key: 'Illustration Style', url: './assets/themes/img_3d.jpg' },
        { name: '吉卜力風格', value: 22, key: 'Ghibli Style', url: './assets/themes/img_cartoon.jpg' },
        { name: '动漫', value: 23, key: 'Anime Style', url: './assets/themes/img_anime.jpg' },
        { name: '赛博庞克', value: 24, key: 'cyberpunk', class: 'cyberpunk', url: './assets/themes/img_cyberpunk.jpg' },
        { name: '水彩畫', value: 25, key: 'watercolor', url: './assets/themes/img_watercolor.jpg' },
        { name: '塗鴉藝術', value: 26, key: 'Graffiti', url: './assets/themes/img_oil_painting.jpg' },
    ],
    StandardStageSizes: [
        {
            title: "指定尺寸",
            content: "550 x 550 像素", // 1
            value: { width: 550, height: 550 },
        },
        {
            title: "指定尺寸",
            content: "550 x 240 像素", // 2
            value: { width: 550, height: 240 },
        },
        {
            title: "指定尺寸",
            content: "550 x 180 像素", // 3
            value: { width: 550, height: 180 },
        },
        {
            title: "指定尺寸",
            content: "1120 x 180 像素", // 4
            value: { width: 1120, height: 180 },
        },
        {
            title: "指定尺寸",
            content: "640 x 196 像素", // 5
            value: { width: 640, height: 196 },
        },
        {
            title: "指定尺寸",
            content: "1120 x 300 像素", // 6
            value: { width: 1120, height: 300 },
        },
        {
            title: "指定尺寸",
            content: "550 x 300 像素", // 7
            value: { width: 550, height: 300 },
        },
        {
            title: "指定尺寸",
            content: "1120 x 240 像素", // 8
            value: { width: 1120, height: 240 },
        },
        {
            title: "指定尺寸",
            content: "310 x 196 像素", // 9
            value: { width: 310, height: 196 },
        },
        {
            title: "指定尺寸",
            content: "640 x 300 像素", // 10
            value: { width: 640, height: 300 },
        },
        {
            title: "指定尺寸",
            content: "1120 x 1120 像素", // 11
            value: { width: 1120, height: 1120 },
        },
        {
            title: "指定尺寸",
            content: "640 x 240 像素", // 12
            value: { width: 640, height: 240 },
        },
        {
            title: "指定尺寸",
            content: "360 x 240 像素", // 13
            value: { width: 360, height: 240 },
        },
        {
            title: "指定尺寸",
            content: "310 x 240 像素", // 14
            value: { width: 310, height: 240 },
        },
        {
            title: "指定尺寸",
            content: "360 x 300 像素", // 15
            value: { width: 360, height: 300 },
        },
    ],
    boxBarSelected: BoxBarTypes.sticker,
}

export const advancedDefaults:IAdvancedSettings = {
    popupMenu: true,
    imageCropEditEnabled: false,
    alignEnabled: false,
    zoomEnabled: true,
    undoRedoEnabled: false,
    eachSideHandlesEnabled: true,
    pivotPointEnabled: true,
}