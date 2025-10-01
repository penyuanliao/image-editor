<script setup lang="ts">
import { ref } from 'vue';
import ImageEditor from './components/ImageUploader.vue';
import type { ImageEditorAction, TextElement } from "./types";
import { ImageEditorTypes } from "./types";
import BoxBar from "./components/BoxBar.vue";
import ImagesPanel from "./components/ImagesPanel.vue";
import AIPanel from "./components/AIPanel.vue";
import TextPanel from "./components/TextPanel.vue";
import StickersPanel from "./components/StickersPanel.vue";
import UploadPanel from "./components/UploadPanel.vue";
import LayersPanel from "./components/LayersPanel.vue";

const editor = ref<InstanceType<typeof ImageEditor> | null>(null);
const selected = ref<string>('');

// State to hold the currently selected element from the canvas
const selectedElementForPanel = ref<TextElement | null>(null);

const handleAddElement = (element: ImageEditorAction) => {
  if (element) {
    editor.value?.addElement(element);
  }
};

const boxItemClickHandle = (value: string) => {
  selected.value = value;
};

// Handler for when an element is selected on the canvas
const handleElementSelected = (element: TextElement | null) => {
  selectedElementForPanel.value = element;
};

// Handler for when the text panel wants to update the selected element
const handleUpdateElement = (newProps: Partial<TextElement>) => {
  editor.value?.updateSelectedElement(newProps);
};

</script>

<template>
  <div class="main-container">
    <BoxBar @boxItemClick="boxItemClickHandle"/>
    <div style="width: auto; height: 100%">
      <AIPanel v-if="selected === ImageEditorTypes.star"/>
      <ImagesPanel v-if="selected === ImageEditorTypes.image"/>
      <TextPanel
          v-if="selected === ImageEditorTypes.text"
          :selected-element="selectedElementForPanel"
          @add-element="handleAddElement"
          @update-element="handleUpdateElement"
      />
      <StickersPanel
          v-if="selected === ImageEditorTypes.sticker"
          @add-element="handleAddElement"
      />
      <LayersPanel v-if="selected === ImageEditorTypes.layers"/>
      <UploadPanel v-if="selected === ImageEditorTypes.upload"/>
    </div>
    <div class="editor-area">
      <ImageEditor
        ref="editor"
        @element-selected="handleElementSelected"
      />
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: grid;
  grid-template-columns: 72px auto 1fr; /* 左側面板 240px，右側佔滿剩餘空間 */
  height: 100vh;
}

.editor-area {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto; /* 如果編輯器太大，允許滾動 */
}
</style>
