<script setup lang="ts">
import { computed, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useImagesStore } from "../store/images.ts";
import type { CanvasElement } from "./useImageEditor.ts";
const input = ref<String>('');
const imagesStore = useImagesStore();

const elementsReverse = computed(() => [...imagesStore.elements].reverse());

let draggedId = -1;

const handleDragStart = (id: number) => {
  draggedId = id;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault(); // Necessary to allow dropping
};

const handleDrop = (id: number) => {
  if (draggedId === -1) return;
  const draggedIndex: number = imagesStore.elements.findIndex((element) => element.id === draggedId);
  const index: number = imagesStore.elements.findIndex((element) => element.id === id);
  if (draggedIndex !== -1 && index !== -1) {
    const draggedItem:CanvasElement = imagesStore.elements.splice(draggedIndex, 1)[0] as CanvasElement;
    imagesStore.elements.splice(index, 0, draggedItem);
  }
  draggedId = -1;
};

</script>

<template>
  <div class="layers-object-container">
    <span class="label">圖層</span>
    <el-input
        v-model="input"
        class="responsive-input"
        placeholder="輸入文字搜尋圖層"
        :prefix-icon="Search"
        clearable
    ></el-input>
    <div class="layers-wrapper">
      <div
          v-for="(item) in elementsReverse"
          :key="item.id"
          class="layer"
          draggable="true"
          @dragstart="handleDragStart(item.id)"
          @dragover="handleDragOver"
          @drop="handleDrop(item.id)"
      >{{ item.type === 'text' ? item.content : item.name }}</div>
    </div>
  </div>
</template>

<style scoped>
.layers-object-container {
  display: flex;
  width: 280px;
  height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  gap: 10px;
}
.responsive-input {
  width: 240px;
  margin-top: 20px;
  height: 40px;
  font-size: medium;
  flex-shrink: 0;
}
.layers-wrapper {
  width: 240px;
  display: flex;
  flex-direction: column;
  .layer {
    width: 240px;
    height: 20px;
    font-size: 12px;
    display: flex;
    border: #444444 1px solid;
    cursor: grab;
  }
  .layer:hover {
    background-color: #444444;
  }
}


</style>
