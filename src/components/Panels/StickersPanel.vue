<script setup lang="ts">
import {computed, ref} from "vue";
import { Search, Close } from "@element-plus/icons-vue";
import {useImagesStore} from "../../store/images.ts";
import {ElementTypesEnum} from "../../types.ts";
import NCarousel from "../Basic/NCarousel.vue";

interface IGallery {
  label: string;
  items: { url: string, filename: string }[];
}

const imagesStore = useImagesStore();

const emit = defineEmits<{ (e: 'add-element', action: any): void }>();

const input = ref<String>('');
const selectTag = ref('全部');

const gallery: IGallery [] = [
  {
    label: '聯名活動素材',
    items: [
        { url: './assets/stickers/coffee.svg', filename: 'coffee' },
        { url: './assets/stickers/dollar.svg', filename: 'dollar' },
        { url: './assets/stickers/fries.svg', filename: 'fries' },
        { url: './assets/stickers/gambler-luck.svg', filename: 'gambler-luck' },
        { url: './assets/stickers/gem.svg', filename: 'gem' },
        { url: './assets/stickers/hamburger.svg', filename: 'hamburger' },
        { url: './assets/stickers/ice-cream.svg', filename: 'ice-cream' },
        { url: './assets/stickers/peach.svg', filename: 'peach' },
        { url: './assets/stickers/soda.svg', filename: 'soda' },
        { url: './assets/stickers/syrup.svg', filename: 'syrup' },
    ]
  },
  {
    label: 'BB Logo素材',
    items: [
        { url: './assets/stickers/target.svg', filename: 'target' },
        { url: './assets/stickers/mustache.svg', filename: 'mustache' },
        { url: './assets/stickers/clock-ring.svg', filename: 'clock-ring' },
    ]
  },
  {
    label: 'BB 產品素材',
    items: [
        { url: './assets/stickers/banking-money.svg', filename: 'banking-money' },
        { url: './assets/stickers/smoker.svg', filename: 'smoker' },
    ]
  }];

const customizedGallery = computed(() => {

  const list: { url: string, filename: string }[] = [];
  imagesStore.imageList.forEach(({ image }) => {
    list.push({
      url: image.src,
      filename: image.src.split('/').pop() || ''
    })
  });
  return list;
});

const tagOptions = computed(() => {
  const options: string[] = ["全部"];
  for (const group of gallery) {
    options.push(group.label);
  }
  return options;
});

const onStickerClick = (stickerUrl: string, filename: string) => {
  emit('add-element', {
    type: ElementTypesEnum.Image,
    config: {
      url: stickerUrl,
      x: 0,
      y: 0,
    }, name: filename
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
            @click="onStickerClick(item.url, item.filename)">
          <img :src="item.url" alt=""/>
        </div>
      </div>
      <template v-for="(group) in gallery">
        <span class="label">{{ group.label }}</span>
        <div class="category-items">
          <div
              v-for="(item, index) in group.items"
              :key="index"
              class="image"
              @click="onStickerClick(item.url, item.filename)">
            <img :src="item.url" alt=""/>
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
