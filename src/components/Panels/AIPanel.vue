<script setup lang="ts">
import { ref } from "vue";
import { Opportunity } from "@element-plus/icons-vue";
import Symbols from "../Symbols.vue";
const styles = ref([
  { name: '自订', key: 'custom', url: './assets/themes/img_custom.png' },
  { name: '3D插画', key: '3d-illustration', url: './assets/themes/img_3d.jpg' },
  { name: '卡通', key: 'cartoon', url: './assets/themes/img_cartoon.jpg' },
  { name: '赛博庞克', key: 'cyberpunk', class: 'cyberpunk', url: './assets/themes/img_cyberpunk.jpg' },
  { name: '动漫', key: 'anime', url: './assets/themes/img_anime.jpg' },
  { name: '像素', key: 'pixel-art', url: './assets/themes/img_pixel_art.jpg' },
  { name: '复古插画', key: 'retro-illustration', url: './assets/themes/img_illustration.jpg' },
  { name: '水彩', key: 'watercolor', url: './assets/themes/img_watercolor.jpg' },
  { name: '油画', key: 'oil-painting', url: './assets/themes/img_oil_painting.jpg' },
  { name: '素描', key: 'sketch', url: './assets/themes/img_sketch.jpg' },
]);

const selectedStyle = ref('3d-illustration');

const remainingTries = ref<Number>(10);

const selectStyle = (styleKey: string) => {
  selectedStyle.value = styleKey;
};
</script>

<template>
  <div class="images-gallery-container">
    <div class="heading">
      <h2>AI生成</h2>
      <div class="description">
        <span class="text">您今日AI换图剩余次数: </span>
        <span class="remaining-tries">{{ remainingTries }}</span>
      </div>
    </div>
    <div class="categories">
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
    <el-button class="submit-btn" type="primary">
      <template #default>
        <span>生成</span>
      </template>
      <template #loading>生成...</template>
      <template #icon><Symbols name="magic"/></template>
    </el-button>
  </div>
</template>

<style scoped lang="scss">

@use "@/styles/theme";

.images-gallery-container {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  overflow-y: hidden;
  padding-bottom: 24px;
  &::-webkit-scrollbar {
    display: none;
  }
}
.heading {
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  h2 {
    font-size: 21px;
    font-weight: 400;
  }
  .description {
    min-width: 0;
  }
  .text {
    font-size: 15px;
    font-weight: 400;
    color: theme.$text-color;
  }
  .remaining-tries {
    font-size: 15px;
    font-weight: 400;
    color: theme.$button-text-color;
  }
}
.categories {
  width: 100%;
  position: relative;
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
    width: 80px;
    height: auto;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    cursor: pointer;
  }
  .image {
    position: relative;
    width: 80px;
    height: 80px;
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
.submit-btn {
  width: 100%;
  color: white;
  background-color: theme.$button-text-color;
  border-radius: 30px;
  border-color: theme.$button-text-color;
}

</style>