<script setup lang="ts">
import { ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { useEditorStore } from "@/store/editorStore.ts";
import { CreateImageElement } from "@/Utilities/useCreateCanvasElement.ts";
import NPanel from "../Basic/NPanel.vue";
import NPanelButton from "@/components/Basic/NPanelButton.vue";
import { generalDefaults } from "@/config/settings.ts";
import { processFile } from "@/Utilities/FileProcessor.ts";
import type { IUploadedImage } from "@/types.ts";

const emit = defineEmits<{ (e: "add-element", action: any): void }>();

const editorStore = useEditorStore();
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    for (const file of Array.from(target.files)) {
      const info = await processFile(file);
      editorStore.addImage(info);
      handleAddingElement(info);
    }
  }
};
const handleAddingElement = ({ name, image, imageUrl, base64 }: IUploadedImage) => {
  // editorStore.addElement(editorStore.createStickerElement(img));
  const element = CreateImageElement({
    name: name || "新圖片",
    image,
    imageUrl,
    base64
  });
  emit("add-element", element);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <NPanel :searchEnabled="false" title="上传">
    <section class="upload-panel-section">
      <NPanelButton @pointerup="triggerFileInput">
        <template #default>上傳圖片</template>
        <template #icon><UploadFilled /></template>
      </NPanelButton>
    </section>
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      multiple
      :accept="generalDefaults.allowedExtensions.join(',')"
      hidden
    />
    <section class="upload-panel-section">
      <div class="upload-panel-list">
        <div
          v-for="(info, index) in editorStore.imageList"
          :key="index"
          class="upload-panel-item"
          :style="{ backgroundImage: `url(${info.image.src})` }"
          @click="handleAddingElement(info)"
        ></div>
      </div>
    </section>
  </NPanel>
</template>

<style scoped lang="scss">
.upload-panel-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
.upload-panel-list {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 10px;
}
.upload-panel-item {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  background-color: rgba(80, 80, 80, 0.3);
  border-radius: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }
  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}
</style>
