<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import type { StickerElement } from "../types.ts";

const emit = defineEmits<{ (e: 'add-element', action: StickerElement): void }>();

const input = ref<String>('');

const gallery: {
  label: string,
  items: string[]
}[] = [
  {
    label: '自訂',
    items: []
  },
  {
    label: '聯名活動素材',
    items: [
        '/assets/stickers/coffee.svg',
        '/assets/stickers/dollar.svg',
        '/assets/stickers/fries.svg',
        '/assets/stickers/gambler-luck.svg',
        '/assets/stickers/gem.svg',
        '/assets/stickers/hamburger.svg',
        '/assets/stickers/ice-cream.svg',
        '/assets/stickers/peach.svg',
        '/assets/stickers/soda.svg',
        '/assets/stickers/syrup.svg',
    ]
  },
  {
    label: 'BB Logo素材',
    items: [
        '/assets/stickers/target.svg',
        '/assets/stickers/mustache.svg',
        '/assets/stickers/clock-ring.svg'
    ]
  },
  {
    label: 'BB 產品素材',
    items: [
        '/assets/stickers/banking-money.svg',
        '/assets/stickers/smoker.svg'
    ]
  }];

const onStickerClick = (stickerUrl: string) => {
  emit('add-element', { type: 'sticker', payload: stickerUrl });
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
              @click="onStickerClick(item)">
            <img :src="item" alt=""/>
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