<script setup lang="ts">
import { computed } from "vue";
import { useImagesStore } from "../store/images.ts";
import draggable from 'vuedraggable';
import type {CanvasElement} from "../Utilities/useImageEditor.ts";

const imagesStore = useImagesStore();

// Create a computed property to reverse the elements for display
// and handle updating the store when the order changes.
const reversedElements = computed({
  get() {
    // Reverse the array for display, so the top layer is at the top of the list
    return [...imagesStore.elements].reverse();
  },
  set(newValue) {
    // When vuedraggable updates the model, it's already in the reversed order.
    // We need to reverse it back before committing to the store.
    imagesStore.elements = [...newValue].reverse();
    // const firstElement = newValue[0];
    // imagesStore.originalImage = firstElement?.img;
  }
});
const onClickLayerHandle = (element: CanvasElement) => {
  console.log(element);
};

</script>

<template>
  <div class="layers-object-container">
    <draggable
        v-model="reversedElements"
        item-key="id"
        class="layers-wrapper"
        ghost-class="ghost"
    >
      <template #item="{ element }">
        <div class="layer" @click="onClickLayerHandle(element)">
          <img v-if="element.type === 'sticker'" :src="element.content" alt=""/>
          <span v-else>{{ element.content }}</span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.layers-object-container {
  display: flex;
  width: 80px;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  gap: 10px;
}
.layers-wrapper {
  width: 80px;
  min-width: 80px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.layer {
  width: 70px;
  height: 70px;
  font-size: 12px;
  display: flex;
  position: relative;
  align-items: center; /* Vertically center the text */
  justify-content: center;
  border: #444444 1px solid;
  cursor: grab;
  background-color: #3a3a3a;
  color: #e0e0e0;
  margin-bottom: 2px; /* Add space between layers */
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.layer:hover {
  background-color: #4f4f4f;
}

.ghost {
  opacity: 0.5;
  background: #409eff;
}

</style>
