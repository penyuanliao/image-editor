<script setup lang="ts">
import { computed } from 'vue';
import { useImagesStore } from '@/store/images.ts';
import AIPanel from "./AIPanel.vue";
import {ElementTypesEnum, type ICanvasElement, type IImageConfig} from "@/types.ts";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import NPanel from "@/components/Basic/NPanel.vue";

const imagesStore = useImagesStore();
// Only show and operate on the panel if a sticker is selected

const selectedElement = computed(() => {
  if (imagesStore.selectedElements.length <= 0) return null;
  if (imagesStore.selectedElements.length > 1) return null;
  const element = imagesStore.selectedElements[0];
  if (element && (element.type === ElementTypesEnum.Image || element.type === ElementTypesEnum.Stage)) {
    return element as ICanvasElement;
  }
  return null;
});
// Computed property to handle degree-radian conversion for the rotation slider
const rotationInDegrees = computed({
  get() {
    if (selectedElement.value && selectedElement.value.config.rotation) {
      // Convert radians to degrees and round to nearest integer
      return Math.round((selectedElement.value.config.rotation * 180) / Math.PI);
    }
    return 0;
  },
  set(degrees: number) {
    if (selectedElement.value) {
      // Convert degrees to radians
      selectedElement.value.config.rotation = (degrees * Math.PI) / 180;
    }
  },
});
const opacityInPercentage = computed({
  get() {
    if (selectedElement.value && typeof selectedElement.value.config.opacity === 'number') {
      return Math.round(selectedElement.value.config.opacity * 100);
    } else {
      return 100;
    }
  },
  set(percentage: number) {
    if (selectedElement.value) {
      selectedElement.value.config.opacity = percentage / 100;
    }
  }
});

const handleHorizontalFlip = () => {
  if (selectedElement.value?.config) {
    if (typeof selectedElement.value.config.scaleX === "number") {
      selectedElement.value.config.scaleX *= -1;
    } else {
      selectedElement.value.config.scaleX = -1;
    }
  }
};
const handleVerticalFlip = () => {
  if (selectedElement.value?.config) {
    if (typeof selectedElement.value.config.scaleY === "number") {
      selectedElement.value.config.scaleY *= -1;
    } else {
      selectedElement.value.config.scaleY = -1;
    }
  }
};

const handleLockAndUnlock = () => {
  if (selectedElement.value?.config) {
    selectedElement.value.config.draggable = !selectedElement.value.config.draggable;
    if (!selectedElement.value?.config.draggable) {
      imagesStore.selectedElements = [];
    } else {
      imagesStore.selectedElements = [selectedElement.value];
    }
  }
}

</script>

<template>
  <NPanel
      v-if="selectedElement"
      :searchEnabled="false">
    <div class="properties">
      <div class="view once-line">
        <img :src="(selectedElement?.config as IImageConfig)?.url" alt="">
      </div>
      <div class="ctrl">
        <span>X：</span>
        <el-input-number class="el-input" v-model="selectedElement.config.x" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y：</span>
        <el-input-number class="el-input" v-model="selectedElement.config.y" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>寬：</span>
        <el-input-number class="el-input" v-model="selectedElement.config.width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number class="el-input" v-model="selectedElement.config.height" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl once-line">
        <span>旋轉角度：</span>
        <el-input-number v-model="rotationInDegrees" :controls="true" style="width: 100%" />
      </div>
      <div class="ctrl once-line slider-with-input">
        <span>透明度：</span>
        <el-slider
            v-model="opacityInPercentage"
            :show-input-controls="false"
            style="width: 100%"
            show-input
            size="small"
            :format-tooltip="(value: number) => value + '%'"
            :format-value-text="(value: number) => value + '%'"
        />
      </div>
      <div class="prop-item center once-line">
        <el-button @click="handleHorizontalFlip">水平鏡射</el-button>
        <el-button @click="handleVerticalFlip">垂直鏡射</el-button>
      </div>
      <div class="prop-item center once-line">
        <el-button :icon="selectedElement.config.draggable ? Unlock : Lock" circle @click="handleLockAndUnlock"/>
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
