<script setup lang="ts">
import { computed } from "vue";
import { useImagesStore } from "../../store/images.ts";
import draggable from 'vuedraggable';
import {ElementTypesEnum, type ICanvasElement} from "../../types.ts";

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
const onClickLayerHandle = (element: ICanvasElement) => {
  imagesStore.setSelectedOnce(element);
};
const onClickBGHandle = () => {
  const el = {
    id: Date.now(),
    type: ElementTypesEnum.Stage,
    name: 'stage',
    config: {
      width: imagesStore.originalImage?.width,
      height: imagesStore.originalImage?.height,
      x: 0,
      y: 0,
    }
  } as ICanvasElement;
  imagesStore.setSelectedOnce(el);
};

</script>

<template>
  <div class="layers-object-container">
    <div class="layers-wrapper">
      <div class="layer" @click="onClickBGHandle">
        <div class="mask"><span>場景</span></div>
        <img v-if="imagesStore.originalImage" :src="imagesStore.originalImage?.src" alt=""/>
      </div>
    </div>
    <draggable
        v-show="reversedElements.length > 0"
        v-model="reversedElements"
        item-key="id"
        class="layers-wrapper"
        ghost-class="ghost"
    >
      <template #item="{ element }">
        <div class="layer" @click="onClickLayerHandle(element)">
          <img v-if="element.type === ElementTypesEnum.Image" :src="element.config.url" alt=""/>
          <span v-else>{{ element.config.content }}</span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.layers-object-container {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  gap: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  span {
    font-size: 18px;
    font-weight: 400;
    color: theme.$primary-color;
    font-family: theme.$font-family;
  }
}
.layers-wrapper {
  width: 100%;
  min-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-sizing: border-box;
  border-radius: 5px;
}
.layer {
  width: 80px;
  height: 80px;
  font-size: 12px;
  display: flex;
  position: relative;
  align-items: center; /* Vertically center the text */
  justify-content: center;
  cursor: grab;
  background-color: #F5F5F5;
  color: theme.$primary-color;
  border-radius: 5px;
  box-sizing: border-box;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  img {
    position: relative;
    width: 72px;
    height: 72px;
    object-fit: contain;
  }
}
.layer:hover {
  border: 2px solid #78EFB2;
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  border-radius: 5px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}


.ghost {
  opacity: 0.5;
  background: #409eff;
}

</style>
