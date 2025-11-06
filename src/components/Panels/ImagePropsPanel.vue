<script setup lang="ts">
import { computed } from 'vue';
import { useImagesStore } from '@/store/images.ts';
import AIPanel from "./AIPanel.vue";
import {type IImageConfig} from "@/types.ts";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import NPanel from "@/components/Basic/NPanel.vue";
import NPosition from "@/components/Basic/NPosition.vue";

const imagesStore = useImagesStore();
// Only show and operate on the panel if a sticker is selected

const emit = defineEmits(['alignElement']);

// Computed property to handle degree-radian conversion for the rotation slider
const rotationInDegrees = computed({
  get() {
    if (imagesStore.selectedElement && imagesStore.selectedElement.config.rotation) {
      // Convert radians to degrees and round to nearest integer
      return Math.round((imagesStore.selectedElement.config.rotation * 180) / Math.PI);
    }
    return 0;
  },
  set(degrees: number) {
    if (imagesStore.selectedElement) {
      // Convert degrees to radians
      imagesStore.selectedElement.config.rotation = (degrees * Math.PI) / 180;
    }
  },
});
const opacityInPercentage = computed({
  get() {
    if (imagesStore.selectedElement && typeof imagesStore.selectedElement.config.opacity === 'number') {
      return Math.round(imagesStore.selectedElement.config.opacity * 100);
    } else {
      return 100;
    }
  },
  set(percentage: number) {
    if (imagesStore.selectedElement) {
      imagesStore.selectedElement.config.opacity = percentage / 100;
    }
  }
});

const handleLockAndUnlock = () => {
  if (imagesStore.selectedElement?.config) {
    imagesStore.selectedElement.config.draggable = !imagesStore.selectedElement.config.draggable;
    if (!imagesStore.selectedElement?.config.draggable) {
      imagesStore.selectedElements = [];
    } else {
      imagesStore.selectedElements = [imagesStore.selectedElement];
    }
  }
}
const handlePositionChange = (value: string) => {

  if (value === 'flip-horizontal') {
    imagesStore.flipHorizontal();
  } else if (value === 'flip-vertical') {
    imagesStore.flipVertical();
  } else {
    const horizontally: string[] = ['left', 'center', 'right'];
    const vertically: string[] = ['top', 'middle', 'bottom'];
    let horizontal = null;
    let vertical = null;
    if (horizontally.includes(value)) {
      horizontal = value;
    }
    if (vertically.includes(value)) {
      vertical = value;
    }
    if (horizontal || vertical) {
      emit('alignElement', horizontal, vertical);
    }
  }
}

</script>

<template>
  <NPanel
      v-if="imagesStore.selectedElement"
      padding="30px 16px 0 16px"
      :searchEnabled="false">
    <div class="properties">
      <div class="view once-line">
        <img :src="(imagesStore.selectedElement?.config as IImageConfig)?.url" alt="">
      </div>
      <div class="ctrl">
        <span>X：</span>
        <el-input-number class="el-input" v-model="imagesStore.selectedElement.config.x" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y：</span>
        <el-input-number class="el-input" v-model="imagesStore.selectedElement.config.y" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>寬：</span>
        <el-input-number class="el-input" v-model="imagesStore.selectedElement.config.width" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number class="el-input" v-model="imagesStore.selectedElement.config.height" :controls="false" style="width: 100%" />
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
      <div class="ctrl">
        <NPosition @change="handlePositionChange"/>
      </div>
      <div class="prop-item center once-line">
        <el-tooltip :content="`${imagesStore.selectedElement?.config.draggable ? '鎖定' : '解鎖'}`" placement="top">
          <el-button :icon="imagesStore.selectedElement?.config.draggable ? Unlock : Lock" circle @click="handleLockAndUnlock"/>
        </el-tooltip>
        <el-tooltip content="刪除" placement="top">
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
