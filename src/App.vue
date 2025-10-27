<script setup lang="ts">
import {computed, ref} from 'vue';
import ImageEditor from './components/ImageUploader.vue';
import {type ICanvasElement, ImageEditorTypes} from "./types";
import BoxBar from "./components/BoxBar.vue";
import ImagesPanel from "./components/ImagesPanel.vue";
import AIPanel from "./components/AIPanel.vue";
import TextPanel from "./components/TextPanel.vue";
import StickersPanel from "./components/StickersPanel.vue";
import UploadPanel from "./components/UploadPanel.vue";
import LayersPanel from "./components/LayersPanel.vue";

import { useImagesStore } from "./store/images";
import ImagePropsPanel from "./components/ImagePropsPanel.vue";
const imagesStore = useImagesStore();
const editor = ref<InstanceType<typeof ImageEditor> | null>(null);
const selected = ref<string>('');

// State to hold the currently selected element from the canvas
const selectedElementForPanel = ref<any | null>(null);

const handleAddElement = (element: any) => {
  if (element) {
    editor.value?.addElement(element);
  }
};

const boxItemClickHandle = (value: string) => {
  if (selected.value === value) selected.value = '';
  else selected.value = value;
};

// Handler for when an element is selected on the canvas
const handleElementSelected = (element: ICanvasElement | null) => {
  selectedElementForPanel.value = element;
};

// Handler for when the text panel wants to update the selected element
const handleUpdateElement = (newProps: Partial<ICanvasElement>) => {
  editor.value?.updateSelectedElement(newProps);
};

const selectedElement = computed(() => {
  if (imagesStore.selectedElements.length <= 0) return null;
  if (imagesStore.selectedElements.length > 1) return null;
  return imagesStore.selectedElements[0];
})

</script>

<template>
  <div class="main-container">
    <BoxBar @boxItemClick="boxItemClickHandle"/>
    <div style="width: auto; height: 100%">
      <AIPanel v-if="selected === ImageEditorTypes.star"/>
      <ImagesPanel v-if="selected === ImageEditorTypes.image"/>
      <TextPanel
          v-if="selected === ImageEditorTypes.text"
          :controlEnabled="false"
          @add-element="handleAddElement"
          @update-element="handleUpdateElement"
      />
      <StickersPanel
          v-if="selected === ImageEditorTypes.sticker"
          @add-element="handleAddElement"
      />
      <UploadPanel
          v-if="selected === ImageEditorTypes.upload"
          @add-element="handleAddElement"
      />
    </div>
    <div class="editor-area">
      <ImageEditor
        ref="editor"
        @element-selected="handleElementSelected"
      />
      <div class="layers">
        <LayersPanel/>
      </div>
    </div>
    <div class="properties">
      <TextPanel
          v-if="selectedElement?.type === 'text'"
          :controlEnabled="true"
          @add-element="handleAddElement"
          @update-element="handleUpdateElement"
      />
      <ImagePropsPanel v-if="selectedElement?.type === 'sticker'"/>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: grid;
  grid-template-columns: 72px 280px 1fr auto; /* 左側面板 240px，右側佔滿剩餘空間 */
  height: 100vh;
}

.editor-area {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto; /* 如果編輯器太大，允許滾動 */
  flex-shrink: 0;
}
.layers {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
}
.properties {
  display: flex;
  max-width: 280px;
  min-width: 280px;
  height: 100%;
  flex-direction: column;
}
</style>
