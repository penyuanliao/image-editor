import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { apiGetMaterials, type ResMaterialsData, type ResponseResult } from "@/api/materials.ts";
import { useAccountStore } from "@/store/useAccountStore.ts";
import materialsData from "@/test/material.json";

/**
 * 單一素材項目的格式
 */
export interface IGalleryItem {
  id: number;
  name: string;
  src: string;
  categoryId: number;
  category: string;
  imageGenMode: number;
  group: string;
}

/**
 * 整個素材庫的分類格式
 */
export interface IGallery {
  id: number;
  category: string;
  items: IGalleryItem[];
}
export interface IGalleryInfo {
  id: number;
  name: string;
  src: string;
  categoryId: number;
  category: string;
  categoryIndex: number;
  imageGenMode: number;
}

export interface IGroupThumbnail {
  groupId: number;
  groupName: string;
  groupItems: IGalleryInfo[][];
}

// 取得素材庫的action
export const useMaterialsStore = defineStore("materialsStore", () => {
  // 存放模板列表
  const rawData = ref<ResMaterialsData[]>([]);
  // 記錄讀取狀態
  const isLoading = ref(false);
  // 記錄錯誤訊息
  const error = ref<string | null>(null);
  // 選擇的群組group
  const selectedGroup = ref<number>(0);
  // 群組裡面的material
  const selectedCategoryIndex = ref<number>(0);

  const searchValue = ref<string>("");

  // 從 API 獲取模板的 action
  const getMaterials = async (demo: boolean = false) => {
    isLoading.value = true;
    error.value = null;
    try {
      const accountStore = useAccountStore();
      const result = (!demo) ? await apiGetMaterials({ authorization: accountStore.authorization || "" }) : materialsData as ResponseResult;
      if (result.status) rawData.value = result.data;
      return result;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  };
  const getImageGenMode = (id: number) => {
    const imageGenMode: number = 1;
    // 1=無、2＝風格去背、3=風格不去背、4=換色去背、5=換色不去背
    if (id > 0 && id <= 5) {
      return id;
    } else {
      return imageGenMode;
    }
  };

  const selectedMaterialGroup = computed({
    get: () => selectedGroup,
    set: (value: number) => {
      selectedGroup.value = value;
    }
  });
  // 第一層資料
  const groupList = computed(() => {
    if (!rawData.value) return null;
    return rawData.value.map((group, index) => {
      return {
        id: group.ID,
        index,
        name: group.CategoryName
      };
    });
  });
  // 將 rawData 轉換為 IGallery 格式的 computed 屬性
  const materials = computed<IGallery[]>(() => {
    if (selectedGroup.value == -1) return [];
    const categories = rawData.value[selectedGroup.value];
    if (!categories || !Array.isArray(categories.Info)) return [];
    return categories.Info.map((category) => {
      // 轉換每個分類下的素材項目
      const galleryItems: IGalleryItem[] = category.Info?.map((material) => {
        return {
          id: material.ID,
          name: material.MaterialName,
          src: material.Urlpath,
          categoryId: category.ID,
          group: categories.CategoryName,
          category: `${category.CategoryName}`,
          imageGenMode: getImageGenMode(categories.AIStyle)
        };
      }) || [];

      // 組合成 IGallery 格式
      return {
        id: category.ID,
        category: category.CategoryName,
        items: galleryItems
      };
    });
  });
  const groupThumbnails = computed<IGroupThumbnail[]>(() => {
    const group: IGroupThumbnail[] = [];
    rawData.value.forEach((categories) => {
      if (!categories || !Array.isArray(categories.Info)) return;
      const groupItems: IGalleryInfo[][] = [];
      let col = 0;
      const itemsPerRow: number = 3;
      categories.Info.map((category, index) => {
        const material = category.Info.slice(0, 1);
        if (material.length > 0 && material[0]) {
          if (!groupItems[col]) groupItems[col] = [];
          if (groupItems[col]?.length === itemsPerRow) groupItems[++col] = [];
          groupItems[col]?.push({
            id: material[0].ID,
            name: material[0].MaterialName,
            src: material[0].Urlpath,
            categoryId: category.ID,
            categoryIndex: index,
            category: category.CategoryName,
            imageGenMode: getImageGenMode(categories.AIStyle)
          });
        }
      });
      group.push({
        groupId: categories.ID,
        groupName: categories.CategoryName,
        groupItems
      });
    });
    return group;
  });

  const categoryImages = computed(() => {
    if (selectedCategoryIndex.value == -1) return [];

    const categoryItems = materials.value[selectedCategoryIndex.value];
    if (categoryItems) {
      return categoryItems.items;
    }
  });

  const filtered = computed(() => {
    if (!searchValue.value) {
      return [];
    }
    const searchTerm = searchValue.value.toLowerCase().trim();

    // 使用 flatMap 將多層陣列扁平化
    return rawData.value.flatMap((group) =>
      group.Info.flatMap((category) =>
        category.Info.filter((material) =>
          (material.Tags || "").toLowerCase().includes(searchTerm)
        ).map((material) => ({
          id: material.ID,
          name: material.MaterialName,
          src: material.Urlpath,
          categoryId: category.ID, // 保留分類ID以便追蹤
          imageGenMode: getImageGenMode(group.AIStyle),
          group: group.CategoryName,
          category: category.CategoryName,
        }))
      )
    );
  });

  const categoryName = computed(() => {
    if (selectedGroup.value == -1) return '';

    const categories = rawData.value[selectedGroup.value];
    return categories?.CategoryName || '';
  });

  return {
    searchValue,
    isLoading,
    error,
    getMaterials,
    categoryName,
    groupList,
    materials,
    groupThumbnails,
    categoryImages,
    selectedMaterialGroup,
    selectedCategoryIndex,
    filtered
  };
});
