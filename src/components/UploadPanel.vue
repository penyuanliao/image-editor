<script setup lang="ts">
import { ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { useImagesStore } from "../store/images";
import type {StickerElement} from "../types.ts";

const emit = defineEmits<{ (e: 'add-element', action: StickerElement): void }>();

const imagesStore = useImagesStore();
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    for (const file of Array.from(target.files)) {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // Now that the image is loaded, push the HTMLImageElement to the store
        imagesStore.addImage(img);
        handleAddingElement(img);
      };
      img.src = imageUrl;
    }
  }
};
const handleAddingElement = (img: HTMLImageElement) => {
  // imagesStore.addElement(imagesStore.createStickerElement(img));
  emit('add-element', { type: 'sticker', img, name: '新圖片' });
}

const triggerFileInput = () => {
  fileInput.value?.click();
};

</script>

<template>
  <div class="images-gallery-container">
    <el-button @click="triggerFileInput" type="primary" class="upload-button">
      <el-icon class="el-icon--left"><UploadFilled /></el-icon>
      上傳圖片
    </el-button>
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      multiple
      accept="image/*"
      hidden
    />
    <div class="categories">
      <div class="category-items">
        <div
          v-for="(image, index) in imagesStore.imageList"
          :key="index"
          class="image"
          :style="{ backgroundImage: `url(${image.src})` }"
          @click="handleAddingElement(image)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.images-gallery-container {
  display: flex;
  width: 280px;
  height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    display: none;
  }
}
.upload-button {
  width: 100%;
  height: 40px;
  font-size: medium;
}
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
  width: calc(50% - 5px);
  padding-bottom: calc(50% - 5px); /* Maintain aspect ratio 1:1 */
  height: 0;
  flex-shrink: 0;
  background-color: rgba(80, 80, 80, 0.3);
  border-radius: 4px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }
  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}
</style>
