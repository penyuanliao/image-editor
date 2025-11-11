<script setup lang="ts">
import { ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { useImagesStore } from "@/store/images.ts";
import {CreateImageElement} from "@/Utilities/useCreateCanvasElement.ts";
import NPanel from "../Basic/NPanel.vue";
import NPanelButton from "@/components/Basic/NPanelButton.vue";
import { generalDefaults } from "@/config/settings.ts";
import {processFile} from "@/Utilities/FileProcessor.ts";
import type {IUploadedImage} from "@/types.ts";

const emit = defineEmits<{ (e: 'add-element', action: any): void }>();

const imagesStore = useImagesStore();
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    for (const file of Array.from(target.files)) {
      const info = await processFile(file);
      imagesStore.addImage(info);
      handleAddingElement(info);
    }
  }
};
const handleAddingElement = ({ name, image, imageUrl, base64 }: IUploadedImage) => {
  // imagesStore.addElement(imagesStore.createStickerElement(img));
  const element = CreateImageElement({
    name: name || '新圖片',
    image,
    imageUrl,
    base64,
  })
  emit('add-element', element);
}

const triggerFileInput = () => {
  fileInput.value?.click();
};

</script>

<template>
  <NPanel :searchEnabled="false" title="上传">
    <NPanelButton @pointerup="triggerFileInput">
      <template #default>上傳圖片</template>
      <template #icon><UploadFilled /></template>
    </NPanelButton>
    <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        multiple
        :accept="generalDefaults.supportedImageFiles.join(',')"
        hidden
    />
    <div class="categories">
      <div class="category-items">
        <div
            v-for="(info, index) in imagesStore.imageList"
            :key="index"
            class="image"
            :style="{ backgroundImage: `url(${info.image.src})` }"
            @click="handleAddingElement(info)"
        ></div>
      </div>
    </div>
  </NPanel>
</template>

<style scoped lang="scss">
.categories {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
.category-items {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
}
.image {
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
  background-size: cover;
  background-position: center;
  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }
  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}
</style>
