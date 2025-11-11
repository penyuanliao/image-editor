
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
    imageCropEditEnabled: boolean;
    alignEnabled: boolean;

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
    ]
}

export const advancedDefaults:IAdvancedSettings = {
    imageCropEditEnabled: true,
    alignEnabled: true,
}