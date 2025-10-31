<script setup lang="ts">
import { computed } from 'vue';
import { useImagesStore } from '@/store/images.ts';
import AIPanel from "./AIPanel.vue";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig} from "@/types.ts";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import NPanel from "@/components/Basic/NPanel.vue";

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

const handleHorizontalFlip = () => {
  if (selectedSticker.value?.config) {
    if (typeof selectedSticker.value.config.scaleX === "number") {
      selectedSticker.value.config.scaleX *= -1;
    } else {
      selectedSticker.value.config.scaleX = -1;
    }
  }
};
const handleVerticalFlip = () => {
  if (selectedSticker.value?.config) {
    if (typeof selectedSticker.value.config.scaleY === "number") {
      selectedSticker.value.config.scaleY *= -1;
    } else {
      selectedSticker.value.config.scaleY = -1;
    }
  }
};

const handleLockAndUnlock = () => {
  if (selectedSticker.value?.config) {
    selectedSticker.value.config.draggable = !selectedSticker.value.config.draggable;
    if (!selectedSticker.value?.config.draggable) {
      imagesStore.selectedElements = [];
    } else {
      imagesStore.selectedElements = [selectedSticker.value];
    }
  }
}

</script>

<template>
  <NPanel
      v-if="selectedSticker"
      :searchEnabled="false">
    <div class="properties">
      <div class="view once-line">
        <img :src="(selectedElement?.config as IImageConfig)?.url" alt="">
      </div>
      <div class="ctrl">
        <span>X：</span>
        <el-input-number class="el-input" v-model="selectedSticker.config.x" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y：</span>
        <el-input-number class="el-input" v-model="selectedSticker.config.y" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>寬：</span>
        <el-input-number class="el-input" v-model="selectedSticker.config.width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number class="el-input" v-model="selectedSticker.config.height" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl once-line">
        <span>旋轉角度：</span>
        <el-input-number v-model="rotationInDegrees" :controls="true" style="width: 100%" />
      </div>
      <div class="prop-item center once-line">
        <el-button @click="handleHorizontalFlip">水平鏡射</el-button>
        <el-button @click="handleVerticalFlip">垂直鏡射</el-button>
      </div>
      <div class="prop-item center once-line">
        <el-button :icon="selectedSticker.config.draggable ? Unlock : Lock" circle @click="handleLockAndUnlock"/>
        <el-tooltip content="刪除" placement="top" effect="light">
          <el-button type="danger" :icon="Delete" circle />
        </el-tooltip>
      </div>
    </div>
    <el-divider border-style="solid"/>
    <div class="additional">
      <AIPanel/>
    </div>
  </NPanel>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.additional {
  position: relative;
  display: flex;
  width: 100%;
  gap: 10px;
}
.properties {
  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  span {
    flex-shrink: 0;
    font-size: 15px;
    width: 30%;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 100%;
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
  .once-line {
    grid-column-end: span 2;
  }
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
