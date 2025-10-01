<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import type { StickerElement } from "../types.ts";

const emit = defineEmits<{ (e: 'add-element', action: StickerElement): void }>();

const input = ref<String>('');

const gallery: {
  label: string,
  items: { url: string, filename: string }[]
}[] = [
  {
    label: '自訂',
    items: []
  },
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

const onStickerClick = (stickerUrl: string, filename: string) => {
  emit('add-element', { type: 'sticker', payload: stickerUrl, name: filename });
};

</script>

<template>
  <div class="images-gallery-container">
    <span class="label">素材</span>
    <el-input
        v-model="input"
        class="responsive-input"
        placeholder="搜尋素材"
        :prefix-icon="Search"
        clearable
    ></el-input>
    <div class="categories">
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

<style scoped>
.images-gallery-container {
  display: flex;
  width: 280px;
  height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
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
  .label {
    flex-shrink: 0;
  }
  .category-items {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
  }
  .image {
    width: 110px;
    height: 110px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 4px;
    margin-top: 5px;
    margin-bottom: 5px;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
    }
    img {
      object-fit: contain;
      margin: 10px 10px;
    }
  }
}


</style>
