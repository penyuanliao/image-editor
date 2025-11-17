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
}

export const generalDefaults: IGeneralSettings = {
    viewport: {
        width: 720,
        height: 480,
        color: "transparent",
        maxWidth: 800,
        maxHeight: 600
    },
    supportedImageFiles: ["image/png", "image/jpeg"]
};

export const appearanceDefaults = {
    AIStyles: [
        { name: '自订', value: 0, key: 'custom', url: './assets/themes/img_custom.png' },
        { name: '3D插画', value: 1, key: 'Illustration Style', url: './assets/themes/img_3d.jpg' },
        { name: '吉卜力風格', value: 2, key: 'Ghibli Style', url: './assets/themes/img_cartoon.jpg' },
        { name: '动漫', value: 3, key: 'Anime Style', url: './assets/themes/img_anime.jpg' },
        { name: '赛博庞克', value: 4, key: 'cyberpunk', class: 'cyberpunk', url: './assets/themes/img_cyberpunk.jpg' },
        { name: '水彩畫', value: 5, key: 'watercolor', url: './assets/themes/img_watercolor.jpg' },
        { name: '塗鴉藝術', value: 6, key: 'Graffiti', url: './assets/themes/img_oil_painting.jpg' },
    ],
    StandardStageSizes: [
        {
            title: "標誌",
            content: "800 x 600 像素",
            value: { width: 800, height: 600 }
        },
        {
            title: "橫幅A",
            content: "750 x 750 像素",
            value: { width: 750, height: 750 }
        },
        {
            title: "橫幅B",
            content: "750 x 200 像素",
            value: { width: 750, height: 200 }
        }
    ],
    boxBarSelected: BoxBarTypes.sticker,
}

export const advancedDefaults:IAdvancedSettings = {
    popupMenu: true,
    imageCropEditEnabled: false,
    alignEnabled: false,
    zoomEnabled: false,
}