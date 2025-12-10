<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import { Minus, Plus } from "@element-plus/icons-vue";

const editorStore = useEditorStore();

const zoomPercentage = computed(() => {
  return `${Math.round(editorStore.divScale * (editorStore.stage.config.scaleX || 1) * 100)}%`;
});
const disabled = computed(() => editorStore.elements.length === 0);

const zoomIn = () => {
  const scaleFactor = editorStore.stage.config.scaleX || 1;
  editorStore.setDivScale(editorStore.divScale + 0.1 / scaleFactor);
  editorStore.updateViewTranslate();
};

const zoomOut = () => {
  const scaleFactor = editorStore.stage.config.scaleX || 1;
  const newScale = Math.max(0.1 / scaleFactor, editorStore.divScale - 0.1 / scaleFactor); // 確保不會小於最小比例
  editorStore.setDivScale(newScale);
  editorStore.updateViewTranslate();
};
</script>

<template>
  <div class="control">
    <el-button :icon="Minus" @click="zoomOut" :disabled="disabled"></el-button>
    <p class="zoom-value">{{ zoomPercentage }}</p>
    <el-button :icon="Plus" @click="zoomIn" :disabled="disabled"></el-button>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.control {
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 16px 4px;
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
}

</style>