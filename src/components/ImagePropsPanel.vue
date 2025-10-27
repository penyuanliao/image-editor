<script setup lang="ts">
import { computed } from 'vue';
import { useImagesStore } from '../store/images';
import AIPanel from "./AIPanel.vue";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig} from "../types.ts";

const imagesStore = useImagesStore();

const selectedElement = computed(() => {
  if (imagesStore.selectedElements.length <= 0) return null;
  if (imagesStore.selectedElements.length > 1) return null;
  return imagesStore.selectedElements[0];
});
// Only show and operate on the panel if a sticker is selected
const selectedSticker = computed(() => {
  if (selectedElement.value && (selectedElement.value.type === ElementTypesEnum.Image || selectedElement.value.type === ElementTypesEnum.Stage)) {
    return selectedElement.value as ICanvasElement;
  }
  return null;
});
// Computed property to handle degree-radian conversion for the rotation slider
const rotationInDegrees = computed({
  get() {
    if (selectedSticker.value && selectedSticker.value.config.rotation) {
      // Convert radians to degrees and round to nearest integer
      return Math.round((selectedSticker.value.config.rotation * 180) / Math.PI);
    }
    return 0;
  },
  set(degrees: number) {
    if (selectedSticker.value) {
      // Convert degrees to radians
      selectedSticker.value.config.rotation = (degrees * Math.PI) / 180;
    }
  },
});

</script>

<template>
  <div v-if="selectedSticker" class="image-props-container">
    <div v-if="selectedSticker.type === ElementTypesEnum.Image" class="properties">
      <div class="view">
        <img :src="(selectedElement?.config as IImageConfig)?.url" alt="">
      </div>
      <div class="ctrl">
        <span>X：</span>
        <el-input-number v-model="selectedSticker.config.x" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y：</span>
        <el-input-number v-model="selectedSticker.config.y" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>寬：</span>
        <el-input-number v-model="selectedSticker.config.width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number v-model="selectedSticker.config.height" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>旋轉角度：</span>
        <el-input-number v-model="rotationInDegrees" :controls="false" style="width: 100%" />
      </div>
    </div>
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
