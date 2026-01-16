<script setup lang="ts">
import { computed, type PropType } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import { Minus, Plus } from "@element-plus/icons-vue";
import { generalDefaults, type IZoomControlVisible } from "@/config/settings.ts";

defineProps({
  visible: {
    type: Object as PropType<IZoomControlVisible>,
    default: () => ({ slider: true, decreaseIncrease: true })
  }
});

const editorStore = useEditorStore();

const zoomPercentage = computed(() => {
  return `${Math.round(editorStore.viewTranslate.scale * (editorStore.stage.config.scaleX || 1) * 100)}%`;
});
const zoomMaximum = computed(() => generalDefaults.zoomLimits.max * 100);

const zoomMinimum = computed(() => generalDefaults.zoomLimits.min * 100);

const zoomPerUnit: number = generalDefaults.zoomLimits.perUnit;

const zoom = computed({
  get() {
    return Math.round(
      editorStore.viewTranslate.scale * (editorStore.stage.config.scaleX || 1) * 100
    );
  },
  set(val: number) {
    const scaleFactor = editorStore.stage.config.scaleX || 1;
    editorStore.setScale(val / 100 / scaleFactor);
    editorStore.viewTranslate.autoScale = false;
    editorStore.updateViewTranslate();
  }
});

const disabled = computed(() => editorStore.elements.length === 0);

const zoomIn = () => {
  const scaleFactor = editorStore.stage.config.scaleX || 1;
  editorStore.setScale(editorStore.viewTranslate.scale + zoomPerUnit / scaleFactor);
  editorStore.viewTranslate.autoScale = false;
  editorStore.updateViewTranslate();
};

const zoomOut = () => {
  const scaleFactor = editorStore.stage.config.scaleX || 1;
  const newScale = Math.max(
    zoomPerUnit / scaleFactor,
    editorStore.viewTranslate.scale - zoomPerUnit / scaleFactor
  ); // 確保不會小於最小比例
  editorStore.setScale(newScale);
  editorStore.viewTranslate.autoScale = false;
  editorStore.updateViewTranslate();
};
</script>

<template>
  <div class="zoom-container">
    <div class="control">
      <el-button
        v-if="visible.decreaseIncrease"
        :icon="Minus"
        @click="zoomOut"
        :disabled="disabled"
      ></el-button>
      <el-slider
        v-if="visible.slider"
        class="zoom-slider"
        size="small"
        v-model="zoom"
        :min="zoomMinimum"
        :max="zoomMaximum"
        :show-tooltip="false"
        :disabled="disabled"
      />
      <p class="zoom-value">{{ zoomPercentage }}</p>
      <el-button
        v-if="visible.decreaseIncrease"
        :icon="Plus"
        @click="zoomIn"
        :disabled="disabled"
      ></el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.zoom-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.control {
  height: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 4px 0 4px;
  border: 1px solid transparent;
  color: theme.$text-color;

  .el-button {
    border: none;
    background-color: transparent;
  }
}
.zoom-value {
  padding: 0 10px;
  text-align: center;
  width: 50px; // 確保寬度足夠顯示百分比
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: 0.2em;
  color: theme.$text-color-info;

}

.zoom-slider {
  /* 透過 CSS 變數覆寫 Element Plus 預設大小 */
  --el-slider-button-size: 20px; /* 滑塊按鈕大小 (預設約 20px) */
  --el-slider-height: 8px; /* 軌道高度 (預設約 6px) */
  width: 250px;
  min-width: 100px;
  max-width: 250px;
  padding-left: 10px;
  padding-top: 4px;
  --el-slider-main-bg-color: transparent;
  :deep(.el-slider__button) {
    border-color: #F15624;
    border-width: 1px;
  }
}
</style>
