import {defineStore} from 'pinia';
import {computed, ref} from 'vue';

export interface ResponseResult {
    status: boolean;
    message?: string;
    data: MaterialsData[];
}
export interface MaterialInfo {
    ID: number;
    MaterialName: string;
    Urlpath: string;
}
export interface MaterialGroup {
    ID: number;
    CategoryName: string;
    Info: MaterialInfo[];
}

export interface MaterialsData {
    ID: number;
    CategoryName: string;
    Info: MaterialGroup[];
}


/**
 * 單一素材項目的格式
 */
export interface IGalleryItem {
    id: number;
    name: string;
    src: string;
    visible: boolean;
}

/**
 * 整個素材庫的分類格式
 */
export interface IGallery {
    id: number;
    category: string;
    visible: boolean;
    items: IGalleryItem[];
}
// 取得素材庫的action
export const useMaterialsStore = defineStore('materialsStore', () => {
    // 存放模板列表
    const rawData = ref<MaterialsData[]>([
        /*{
            ID: 1,
            CategoryName: '聯名活動素材',
            Info: [
                { ID: 1, Urlpath: './assets/stickers/coffee.png', MaterialName: 'coffee' },
                { ID: 2, Urlpath: './assets/stickers/dollar.svg', MaterialName: 'dollar' },
                { ID: 3, Urlpath: './assets/stickers/fries.svg', MaterialName: 'fries' },
                { ID: 4, Urlpath: './assets/stickers/gambler-luck.svg', MaterialName: 'gambler-luck' },
                { ID: 5, Urlpath: './assets/stickers/gem.svg', MaterialName: 'gem' },
                { ID: 6, Urlpath: './assets/stickers/hamburger.svg', MaterialName: 'hamburger' },
                { ID: 7, Urlpath: './assets/stickers/ice-cream.svg', MaterialName: 'ice-cream' },
                { ID: 8, Urlpath: './assets/stickers/peach.svg', MaterialName: 'peach' },
                { ID: 9, Urlpath: './assets/stickers/soda.svg', MaterialName: 'soda' },
                { ID: 10, Urlpath: './assets/stickers/syrup.svg', MaterialName: 'syrup' },
            ]
        },
        {
            ID: 2,
            CategoryName: 'BB Logo素材',
            Info: [
                { ID: 11, Urlpath: './assets/stickers/target.svg', MaterialName: 'target' },
                { ID: 12, Urlpath: './assets/stickers/mustache.svg', MaterialName: 'mustache' },
                { ID: 13, Urlpath: './assets/stickers/clock-ring.svg', MaterialName: 'clock-ring' },
            ]
        },
        {
            ID: 3,
            CategoryName: 'BB 產品素材',
            Info: [
                { ID: 14, Urlpath: './assets/stickers/banking-money.svg', MaterialName: 'banking-money' },
                { ID: 15, Urlpath: './assets/stickers/smoker.svg', MaterialName: 'smoker' },
            ]
        }
        */
    ]);
    // 記錄讀取狀態
    const isLoading = ref(false);
    // 記錄錯誤訊息
    const error = ref<string | null>(null);
    // 選擇的群組group
    const selectedGroup = ref<number>(0);
    // 群組裡面的material
    const selectedCategoryId = ref<number>(0);

    // 從 API 獲取模板的 action
    const getMaterials = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            // 這裡替換成你真實的 API 請求
            const response = await fetch('/api/frontend/material/list');
            if (!response.ok) {
                throw new Error('Failed to fetch materials');
            }
            const result: ResponseResult = await response.json();
            if (result.status) rawData.value = result.data;
            return result;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    const selectedMaterialGroup = computed({
        get: () => selectedGroup,
        set: (value: number) => {
            selectedGroup.value = value;
        }
    })
    // 第一層資料
    const groupList = computed(() => {
       if (!rawData.value) return null;
       return rawData.value.map((group, index) => {
           return {
               id: group.ID,
               index,
               name: group.CategoryName
           }
       });
    });
    // 將 rawData 轉換為 IGallery 格式的 computed 屬性
    const materials = computed<IGallery[]>(() => {
        if (selectedGroup.value == -1) return [];
        const categories = rawData.value[selectedGroup.value];
        if (!categories || !Array.isArray(categories.Info)) return [];
        return categories.Info.map((categoryData) => {
            // 轉換每個分類下的素材項目
            const galleryItems: IGalleryItem[] = categoryData.Info.map((materialInfo) => {
                return {
                    id: materialInfo.ID,
                    name: materialInfo.MaterialName,
                    src: materialInfo.Urlpath,
                    categoryId: categoryData.ID,
                    visible: true
                };
            });

            // 組合成 IGallery 格式
            return {
                id: categoryData.ID,
                category: categoryData.CategoryName,
                items: galleryItems,
                visible: true,
            };
        });
    });
    const categoryImages = computed(() => {
        if (selectedCategoryId.value == -1) return [];
        const categoryItems = materials.value[selectedCategoryId.value];
        if (categoryItems) {
            return categoryItems.items;
        }
    })

    return {
        isLoading,
        error,
        getMaterials,
        groupList,
        materials,
        categoryImages,
        selectedMaterialGroup,
        selectedCategoryId,
    };
});