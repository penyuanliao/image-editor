<script setup lang="ts">
import { computed } from "vue";

const emit = defineEmits(["change"]);
const props = defineProps(["cropBox", "viewport", "divScale", "update:cropBox", "update:scale", "update:viewport", "update:divScale"]);

// 建立一個給 UI 使用的 computed 屬性，它包含 getter 和 setter
const displayCropBox = computed(() => {
  // 當 UI 讀取值時，我們回傳原始值，因為縮放轉換在 CanvasEditor 內部處理更佳
  // 如果未來需要在 UI 顯示不同單位的值，可以在這裡進行轉換
  const scaleFactor = 1 / props.viewport.scale;
  return {
    x: Math.round(props.cropBox.x * scaleFactor),
    y: Math.round(props.cropBox.y * scaleFactor),
    width: Math.min(Math.round(props.cropBox.width * scaleFactor * 100) / 100, props.viewport.originalWidth),
    height: Math.min(Math.round(props.cropBox.height * scaleFactor * 100) / 100, props.viewport.originalHeight)
  };
});

const zoom = computed(() => {
  return props.divScale * props.viewport.scale;
})

const handleChange = (key: string, currentValue: number) => {
  emit("change", key, currentValue);
}

</script>

<template>
  <div class="crop-controls">
    <div class="input-group">
      <label for="crop-x">X:</label>
      <input id="crop-x" type="number" v-model.number="displayCropBox.x"
             @change="(e: Event) => handleChange('x', parseInt((e.target as HTMLInputElement)?.value) || 0)"/>
    </div>
    <div class="input-group">
      <label for="crop-y">Y:</label>
      <input id="crop-y" type="number" v-model.number="displayCropBox.y"
             @change="(e: Event) => handleChange('y', parseInt((e.target as HTMLInputElement)?.value) || 0)"/>
    </div>
    <div class="input-group">
      <label for="crop-width">寬:</label>
      <input id="crop-width" type="number" v-model.number="displayCropBox.width"
             @change="(e: Event) => handleChange('width', parseInt((e.target as HTMLInputElement)?.value) || 0)"/>
    </div>
    <div class="input-group">
      <label for="crop-height">高:</label>
      <input id="crop-height" type="number" v-model.number="displayCropBox.height"
             @change="(e: Event) => handleChange('height', parseInt((e.target as HTMLInputElement)?.value) || 0)"/>
    </div>
    <div class="input-group">
      <span>{{ `${viewport.originalWidth} x ${viewport.originalHeight}` }}</span>
      <span>{{ `${Math.floor(zoom * 100)}%` }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.crop-controls {
  display: flex;
  position: relative;
  gap: 1rem;
  align-items: center;
  background-color: #fff;
  padding: 15px 30px;
  border-radius: 15px;
  height: 30px;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.input-group label {
  font-size: 15px;
  color: #555;
  font-weight: 700;
}

.input-group input {
  width: 40px;
  max-width: 60px;
  padding: 4px 8px;
  border: 1px solid theme.$border-color-base;
  border-radius: 4px;
  text-align: right;
}

.input-group span {
  font-size: 15px;
  color: theme.$text-color;
  font-weight: 700;
}

.input-group input::-webkit-outer-spin-button,
.input-group input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-group input[type=number] {
  -moz-appearance: textfield;
}
</style>