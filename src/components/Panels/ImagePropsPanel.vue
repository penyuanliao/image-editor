<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/store/editorStore.ts';
import AIPanel from "./AIPanel.vue";
import {type IImageConfig} from "@/types.ts";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import NPanel from "@/components/Basic/NPanel.vue";
import NPosition from "@/components/Basic/NPosition.vue";

const editorStore = useEditorStore();
// Only show and operate on the panel if a sticker is selected

const emit = defineEmits(['alignElement', 'refresh']);

const safeConfigAccess = (prop: keyof IImageConfig, defaultValue: number) => {
  return computed({
    get() {
      return (editorStore.selectedElement?.config as IImageConfig)?.[prop] as number ?? defaultValue;
    },
    set(value: number) {
      if (editorStore.selectedElement?.config) {
        // @ts-ignore
        (editorStore.selectedElement.config as IImageConfig)[prop] = value;
      }
    }
  });
};

const configX = safeConfigAccess('x', 0);
const configY = safeConfigAccess('y', 0);
const configWidth = safeConfigAccess('width', 100);
const configHeight = safeConfigAccess('height', 100);

const opacityInPercentage = computed({
  get() {
    if (editorStore.selectedElement && typeof editorStore.selectedElement.config.opacity === 'number') {
      return Math.round(editorStore.selectedElement.config.opacity * 100);
    } else {
      return 100;
    }
  },
  set(percentage: number) {
    if (editorStore.selectedElement) {
      editorStore.selectedElement.config.opacity = percentage / 100;
    }
  }
});

const handleLockAndUnlock = () => {
  if (editorStore.selectedElement?.config) {
    editorStore.selectedElement.config.draggable = !editorStore.selectedElement.config.draggable;
    if (!editorStore.selectedElement?.config.draggable) {
      editorStore.selectedElements = [];
    } else {
      editorStore.selectedElements = [editorStore.selectedElement];
    }
  }
}
const handlePositionChange = (value: string) => {

  if (value === 'flip-horizontal') {
    editorStore.flipHorizontal();
  } else if (value === 'flip-vertical') {
    editorStore.flipVertical();
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
const handleDeleted = () => {
  const id = editorStore.selectedElement?.id;
  if (id) {
    editorStore.removeElements([id]);
  }
}


</script>

<template>
  <NPanel
      padding="30px 25px 0 25px"
      :searchEnabled="false">
    <div v-if="editorStore.selectedElement" class="properties">
      <div class="view once-line">
        <img :src="(editorStore.selectedElement?.config as IImageConfig)?.url" alt="">
      </div>
      <div class="ctrl">
        <span>X：</span>
        <el-input-number class="el-input" v-model="configX" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y：</span>
        <el-input-number class="el-input" v-model="configY" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>寬：</span>
        <el-input-number class="el-input" v-model="configWidth" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>高：</span>
        <el-input-number class="el-input" v-model="configHeight" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl once-line">
        <span>旋轉角度：</span>
        <el-input-number v-model="editorStore.rotationInDegrees" :controls="true" style="width: 100%" />
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
        <el-tooltip :content="`${editorStore.selectedElement?.config.draggable ? '鎖定' : '解鎖'}`" placement="top">
          <el-button :icon="editorStore.selectedElement?.config.draggable ? Unlock : Lock" circle @click="handleLockAndUnlock"/>
        </el-tooltip>
        <el-tooltip content="刪除" placement="top">
          <el-button type="danger" :icon="Delete" @pointerup="handleDeleted">刪除</el-button>
        </el-tooltip>
      </div>
    </div>
    <el-divider border-style="solid"/>
    <div class="additional">
      <AIPanel @refresh="emit('refresh')"/>
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
