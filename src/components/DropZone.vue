<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['files-dropped']);

const isDraggingOver = ref(false);

const handleDragOver = (event: DragEvent) => {
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
    emit('files-dropped', files);
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
.drop-zone.dragging-over {
  border: 2px dashed #409eff; /* 拖曳時的邊框樣式 */
  background-color: rgba(64, 158, 255, 0.1); /* 拖曳時的背景色 */
  box-sizing: border-box; /* 確保邊框不會增加元素大小 */
}
</style>