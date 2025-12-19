<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["files-dropped"]);

const isDraggingOver = ref(false);

const handleDragOver = (event: DragEvent) => {
  // 檢查拖曳的物件中是否包含檔案
  const hasFiles = event.dataTransfer?.types.includes("Files");
  if (!hasFiles) {
    return; // 如果不是檔案，則不處理
  }
  event.preventDefault();
  isDraggingOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDraggingOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDraggingOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    emit("files-dropped", files);
  }
};
</script>

<template>
  <div
    class="drop-zone"
    :class="{ 'dragging-over': isDraggingOver }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.drop-zone {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
}
.drop-zone.dragging-over {
  background-color: rgba(64, 158, 255, 0.1); /* 拖曳時的背景色 */
}
</style>
