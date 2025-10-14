<script setup lang="ts">
import { computed } from 'vue';
import { useImagesStore } from '../store/images';
import type { StickerElement } from '../Utilities/useImageEditor.ts';
import AIPanel from "./AIPanel.vue";
import {ElMessageBox} from "element-plus";

const imagesStore = useImagesStore();

// Only show and operate on the panel if a sticker is selected
const selectedSticker = computed(() => {
  if (imagesStore.selectedElement && (imagesStore.selectedElement.type === 'sticker' || imagesStore.selectedElement.type === 'text')) {
    return imagesStore.selectedElement as StickerElement;
  }
  return null;
});

// Computed property to handle degree-radian conversion for the rotation slider
const rotationInDegrees = computed({
  get() {
    if (selectedSticker.value && selectedSticker.value.rotation) {
      // Convert radians to degrees and round to nearest integer
      return Math.round((selectedSticker.value.rotation * 180) / Math.PI);
    }
    return 0;
  },
  set(degrees: number) {
    if (selectedSticker.value) {
      // Convert degrees to radians
      selectedSticker.value.rotation = (degrees * Math.PI) / 180;
    }
  },
});

const handleReplaceBackground = async () => {
  if (!imagesStore.selectedElement) return;

  const result = await ElMessageBox.confirm(
      '確定取代背景？',
      '設定背景確認',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).catch(() => 'cancel');
  if (result === 'cancel') return;
  imagesStore.originalImage = imagesStore.selectedElement?.img;
  imagesStore.imageUrl = imagesStore.selectedElement?.img?.src || null;
  imagesStore.removeElement(imagesStore.selectedElement?.id);
  imagesStore.selectedElement = null;
}

</script>

<template>
  <div v-if="selectedSticker" class="image-props-container">
    <div class="properties">
      <div class="view">
        <img :src="imagesStore.selectedElement?.content" alt="">
      </div>
      <div class="ctrl">
        <span>X：</span>
        <el-input-number v-model="selectedSticker.x" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y：</span>
        <el-input-number v-model="selectedSticker.y" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>寬：</span>
        <el-input-number v-model="selectedSticker.width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number v-model="selectedSticker.height" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>旋轉角度：</span>
        <el-input-number v-model="rotationInDegrees" :controls="false" style="width: 100%" />
      </div>
    </div>
    <el-button plain @click="handleReplaceBackground">取代背景</el-button>
    <div class="additional">
      <AIPanel></AIPanel>
    </div>
  </div>
</template>

<style scoped>
.image-props-container {
  display: flex;
  width: 280px;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  padding-top: 10px;
  gap: 10px;
  &::-webkit-scrollbar {
    display: none;
  }
}
.additional,
.properties {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #ffffff;
  span {
    flex-shrink: 0;
    width: 80px;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 260px;
  }
  .view {
    width: 100%;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      }
  }
}
</style>
