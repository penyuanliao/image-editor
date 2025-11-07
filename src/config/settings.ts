export interface IAdvancedSettings {
    imageCropEditEnabled: boolean;
}


export const appearanceDefaults = {
    AIStyles: [
        { name: '自订', value: 0, key: 'custom', url: './assets/themes/img_custom.png' },
        { name: '3D插画', value: 1, key: 'Illustration Style', url: './assets/themes/img_3d.jpg' },
        { name: '吉卜力風格', value: 2, key: 'Ghibli Style', url: './assets/themes/img_cartoon.jpg' },
        { name: '动漫', value: 3, key: 'Anime Style', url: './assets/themes/img_anime.jpg' },
        { name: '水墨畫', value: 4, key: 'Black and white ink painting', url: './assets/themes/img_pixel_art.jpg' },
        { name: '赛博庞克', value: 5, key: 'cyberpunk', class: 'cyberpunk', url: './assets/themes/img_cyberpunk.jpg' },
        { name: '像素藝術', value: 6, key: 'pixel-art', url: './assets/themes/img_pixel_art.jpg' },
        { name: '水彩畫', value: 7, key: 'watercolor', url: './assets/themes/img_watercolor.jpg' },
        { name: '塗鴉藝術', value: 8, key: 'Graffiti', url: './assets/themes/img_oil_painting.jpg' },
    ]
}

export const advancedDefaults:IAdvancedSettings = {
    imageCropEditEnabled: false
}