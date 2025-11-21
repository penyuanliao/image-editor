<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEditorStore } from '@/store/editorStore.ts';
import AIPanel from "./AIPanel.vue";
import {type IImageConfig} from "@/types.ts";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import NPanel from "@/components/Basic/NPanel.vue";
import NPosition from "@/components/Basic/NPosition.vue";

const editorStore = useEditorStore();
// Only show and operate on the panel if a sticker is selected

const isRatioLocked = ref(true);

const emit = defineEmits(['alignElement', 'refresh']);

const localX = ref(0);
const localY = ref(0);
const localWidth = ref(100);
const localHeight = ref(100);

const percentWidth = computed({
  get() {
    const config = (editorStore.selectedElement?.config as IImageConfig);
    const naturalWidth = (config.img?.naturalWidth) || 1;
    return Math.floor(config.width / naturalWidth * 100);
  },
  set(value) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = (editorStore.selectedElement?.config as IImageConfig);
      const naturalWidth = (config.img?.naturalWidth) || 1;
      el.config.width = naturalWidth * value / 100;
    }
  }
})

const percentHeight = computed({
  get() {
    const config = (editorStore.selectedElement?.config as IImageConfig);
    const naturalHeight = (config.img?.naturalHeight) || 1;
    return Math.floor(config.height / naturalHeight * 100);
  },
  set(value) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = (editorStore.selectedElement?.config as IImageConfig);
      const naturalHeight = (config.img?.naturalHeight) || 1;
      el.config.height = naturalHeight * value / 100;
    }
  }
})

watch(() => editorStore.selectedElement, (newEl) => {
  if (newEl) {
    const config = newEl.config as IImageConfig;
    localX.value = config.x ?? 0;
    localY.value = config.y ?? 0;
    localWidth.value = config.width ?? 100;
    localHeight.value = config.height ?? 100;
  }
}, { immediate: true });

watch(() => editorStore.selectedElement?.config, (newConfig) => {
  if (newConfig) {
    localX.value = newConfig.x ?? 0;
    localY.value = newConfig.y ?? 0;
    localWidth.value = newConfig.width ?? 100;
    localHeight.value = newConfig.height ?? 100;
  }
}, { deep: true });

const configWidth = computed({
  get() {
    return (editorStore.selectedElement?.config as IImageConfig)?.width ?? 100;
  },
  set(value: number) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = el.config as IImageConfig;
      if (value <= 0) value = 1;
      // 當比例鎖定，且輸入值大於0，且原始寬度也大於0時，才進行計算
      if (isRatioLocked.value && value > 0 && config.width > 0) {
        const ratio = config.height / config.width;
        config.height = Math.max(1, Math.round(value * ratio)); // 確保高度至少為 1
      }
      config.width = value;
    }
  }
});

const configHeight = computed({
  get() {
    return (editorStore.selectedElement?.config as IImageConfig)?.height ?? 100;
  },
  set(value: number) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = el.config as IImageConfig;
      // 當比例鎖定，且輸入值大於0，且原始高度也大於0時，才進行計算
      if (isRatioLocked.value && value > 0 && config.height > 0) {
        const ratio = config.width / config.height;
        config.width = Math.max(1, Math.round(value * ratio)); // 確保寬度至少為 1
      }
      config.height = value;
    }
  }
});

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

const handleXChange = (value: number) => {
  if (editorStore.selectedElement?.config) (editorStore.selectedElement.config as IImageConfig).x = value;
};
const handleYChange = (value: number) => {
  if (editorStore.selectedElement?.config) (editorStore.selectedElement.config as IImageConfig).y = value;
};
const handleWidthChange = (value: number) => {
  // 使用現有的 configWidth setter 邏輯
  configWidth.value = value;
};
const handleHeightChange = (value: number) => {
  // 使用現有的 configHeight setter 邏輯
  configHeight.value = value;
};


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
        <span>X</span>
        <el-input-number class="el-input" v-model="localX" @change="handleXChange" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl">
        <span>Y</span>
        <el-input-number class="el-input" v-model="localY" @change="handleYChange" :controls="false" style="width: 100%" />
      </div>
      <div class="ctrl once-line" style="gap: 10px;">
        <span style="width: 30px;">寬</span>
        <el-input-number class="el-input" v-model="localWidth" @change="handleWidthChange" :controls="false" style="width: 100%">
          <template #suffix>px</template>
        </el-input-number>
        <el-input-number class="percent-el-input" v-model="percentWidth" :controls="false" :min="0.01" :max="100" size="small" align="left">
          <template #suffix>%</template>
        </el-input-number>
      </div>
      <div class="ctrl once-line" style="gap: 10px;">
        <span style="width: 30px;">高</span>
        <el-input-number class="el-input" v-model="localHeight" @change="handleHeightChange" :controls="false" style="width: 100%">
          <template #suffix>px</template>
        </el-input-number>
        <el-input-number class="percent-el-input" v-model="percentHeight" :controls="false" :min="0.01" :max="100" size="small" align="left" controls-position="right">
          <template #suffix>%</template>
        </el-input-number>
      </div>

<!--      <div class="ratio-lock">-->
<!--        <el-tooltip :content="isRatioLocked ? '解鎖長寬比' : '鎖定長寬比'" placement="top">-->
<!--          <el-button :icon="isRatioLocked ? Lock : Unlock" text circle @click="isRatioLocked = !isRatioLocked"/>-->
<!--        </el-tooltip>-->
<!--      </div>-->

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
  align-items: center;
  span {
    flex-shrink: 0;
    font-size: 15px;
    width: 30%;
  }
  .ratio-lock {
    grid-column: 2 / 3;
    grid-row: 3 / 4;
    justify-self: center;
    width: 30px;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 100%;
    flex-direction: row;
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
.percent-el-input {
  width: 60px;
  flex-shrink: 0;
  // 覆寫 Element Plus 的內部樣式，預設移除輸入框的邊框效果
  &:deep(.el-input__wrapper) {
    box-shadow: none;
    // 滑鼠移入時才顯示邊框
    &:focus,
    &:hover {
      box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
    }
  }
}



</style>
