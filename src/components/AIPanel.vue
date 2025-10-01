<script setup lang="ts">
import { ref } from "vue";
import { Search, Opportunity } from "@element-plus/icons-vue";
import Symbols from "./Symbols.vue";
const input = ref<String>('');

const materials = ref([
    { id: 1 },
    { id: 2 },
]);
const selectedMaterial = ref<number | null>(null);
const selectMaterial = (materialId: number) => {
    selectedMaterial.value = materialId;
}

const styles = ref([
  { name: '自訂風格', key: 'custom', url: './assets/themes/img_custom.png' },
  { name: '3D插圖', key: '3d-illustration', url: './assets/themes/img_3d.png' },
  { name: '卡通', key: 'cartoon', url: './assets/themes/img_cartoon.png' },
  { name: '賽德龐克', key: 'cyberpunk', class: 'cyberpunk', url: './assets/themes/img_cyberpunk.png' },
  { name: '動漫', key: 'anime', url: './assets/themes/img_anime.png' },
  { name: '像素', key: 'pixel-art', url: './assets/themes/img_pixel_art.png' },
  { name: '復刻插畫', key: 'retro-illustration', url: './assets/themes/img_illustration.png' },
  { name: '水彩', key: 'watercolor', url: './assets/themes/img_watercolor.png' },
  { name: '油畫', key: 'oil-painting', url: './assets/themes/img_oil_painting.png' },
  { name: '素描', key: 'sketch', url: './assets/themes/img_sketch.png' },
]);

const selectedStyle = ref('3d-illustration');

const selectStyle = (styleKey: string) => {
  selectedStyle.value = styleKey;
};
</script>

<template>
  <div class="images-gallery-container">
    <span class="label">AI生成</span>
    <el-input
        v-model="input"
        class="responsive-input"
        placeholder="搜尋素材"
        :prefix-icon="Search"
        clearable
    ></el-input>
    <div class="categories">
      <span class="label">選擇素材</span>
      <div class="category-group">
        <div
          v-for="material in materials"
          :key="material.id"
          class="item"
          @click="selectMaterial(material.id)"
        >
          <div class="image" :class="{ selected: selectedMaterial === material.id }"></div>
        </div>
      </div>
      <span class="label">風格轉換</span>
      <div class="category-group">
        <div
          v-for="style in styles"
          :key="style.key"
          class="item"
          @click="selectStyle(style.key)"
        >
          <div
              class="image"
              :class="{ selected: selectedStyle === style.key }"
          >
            <img :src="style.url" alt=""/>
          </div>
          <span :class="style.class">{{ style.name }}</span>
        </div>
      </div>
    </div>
    <el-button style="width: 100%; height: 40px;" type="primary">
      <template #default>
        <span>生成</span>
      </template>
      <template #loading>生成...</template>
      <template #icon><Symbols name="magic"/></template>
    </el-button>
    <div style="background-color: #444444">
      <el-icon :size="12"><Opportunity/></el-icon>
      <span>您今日AI換圖剩餘次數: </span>
      <span>10</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.images-gallery-container {
  display: flex;
  width: 240px;
  max-height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow-y: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
  padding: 10px 20px;
}
.responsive-input {
  width: 240px;
  margin-top: 20px;
  height: 40px;
  font-size: medium;
}
.categories {
  width: 240px;
  display: flex;
  flex-direction: column;

  .category-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
  }

  .label {
    flex-shrink: 0;
  }
  .item {
    width: 72px;
    height: auto;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    cursor: pointer;
  }
  .image {
    position: relative;
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 4px;
    margin-top: 5px;
    margin-bottom: 5px;
    box-sizing: border-box;
    overflow: hidden;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
      &:after {
        border: 2px solid #f15624;
      }
    }
    &.selected:after {
      border: 2px solid #f15624;
    }
    &:after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}


</style>