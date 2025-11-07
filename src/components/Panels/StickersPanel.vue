<script setup lang="ts">
import {computed, ref} from "vue";
import { Search, Close } from "@element-plus/icons-vue";
import {useImagesStore} from "@/store/images.ts";
import {ElementTypesEnum} from "@/types.ts";
import NCarousel from "../Basic/NCarousel.vue";
import {type IGallery, useMaterialsStore} from "@/store/useMaterialsStore.ts";

const imagesStore = useImagesStore();
const materialsStore = useMaterialsStore()

const emit = defineEmits<{ (e: 'add-element', action: any): void }>();

const input = ref<string>('');
const selectTag = ref('全部');
// 取得素材庫
const gallery: IGallery[] = materialsStore.materials;
// 用來過濾資料的 computed
const filteredGallery = computed<IGallery[]>(() => {
  const searchValue: string = input.value || '';
  let result: IGallery[];
  if (selectTag.value === '全部') {
    result = gallery;
  } else {
    result = gallery.filter(group => group.category === selectTag.value)
  }
  if (searchValue) {
    return result
        .map(group => {
          const filteredItems = group.items.filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase()));
          return { ...group, items: filteredItems };
        })
        .filter(group => group.items.length > 0);
  }
  return result;
});
// 上傳的圖片
const customizedGallery = computed(() => {

  const list: { src: string, name: string }[] = [];
  imagesStore.imageList.forEach(({ image }) => {
    list.push({
      src: image.src,
      name: image.src.split('/').pop() || ''
    })
  });
  return list;
});

const tagOptions = computed(() => {
  const options: string[] = ["全部"];
  for (const group of gallery) {
    options.push(group.category);
  }
  return options;
});

const onStickerClick = (stickerUrl: string, name: string) => {
  emit('add-element', {
    type: ElementTypesEnum.Image,
    config: {
      url: stickerUrl,
      x: 0,
      y: 0,
    }, name: name
  });
};
const onSearchIconClick = () => {
  console.log('onSearchIconClick', input.value);
}

</script>

<template>
  <div class="images-gallery-container">
    <h2 class="heading">选择素材</h2>
    <el-input
        v-model="input"
        class="source-search-input"
        placeholder="搜尋素材"
        :clear-icon="Close"
        clearable
    >
      <template v-slot:suffix>
        <div class="submit-btn" @click="onSearchIconClick">
          <el-icon size="20">
            <Search />
          </el-icon>
        </div>
      </template>
    </el-input>
    <div class="categories">
      <NCarousel v-model:options="tagOptions" v-model:selected="selectTag"/>
      <span class="label">自訂素材</span>
      <div class="category-items">
        <div
            v-for="(item, index) in customizedGallery"
            :key="index"
            class="image"
            @click="onStickerClick(item.src, item.name)">
          <img :src="item.src" alt=""/>
        </div>
      </div>
      <template v-for="(group) in filteredGallery">
        <span class="label">{{ group.category }}</span>
        <div class="category-items">
          <div
              v-for="(item, index) in group.items"
              :key="index"
              class="image"
              @click="onStickerClick(item.src, item.name)">
            <img :src="item.src" alt=""/>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">

@use "../../styles/theme";
.images-gallery-container {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  background-color: theme.$primary-color;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  color: theme.$text-color;
  &::-webkit-scrollbar {
    display: none;
  }
  padding-top: 30px;
  padding-left: 32px;
  padding-right: 35px;
}
.heading {
  width: 100%;
}
.search-btn {
  position: relative;
  width: 262px;
  height: 54px;
  min-height: 54px;
  border-radius: 999px;
  border: 1px solid theme.$border-color-base;
  pointer-events: none;
}



.source-search-input {
  width: 262px;
  font-size: medium;

  // 使用 :deep() 來選取 el-input 內部的 wrapper 元素
  :deep(.el-input__wrapper) {
    height: 54px;
    border: 1px solid theme.$border-color-base;
    border-radius: 999px;
    box-shadow: none; // 移除 focus 時的預設陰影
  }

  // 使用 :deep() 來選取 el-input 內部的 input 元素
  :deep(.el-input__inner) {
    padding-left: 5px; // 讓 placeholder 和輸入文字內縮
  }
  // 調整 clearable 與 suffix-icon 的順序
  :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
  }

  :deep(.el-input__clear) {
    order: -1; // 將 clearable 圖示排在最前面 (order 值越小越靠前)
    margin-right: 8px; // 增加與右側搜尋圖示的間距
  }
  .submit-btn {
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: theme.$secondary-color;
    border-radius: 999px;
    color: white;
    transform: translateX(5px);
  }
}
.categories {
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  .label {
    flex-shrink: 0;
    display: none;
  }
  .image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
    }
    img {
      width: 90%;
      height: 90%;
      object-fit: contain;
    }
  }
  .category-items {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
  }
}


</style>
