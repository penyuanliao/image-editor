<script setup lang="ts">
import { onMounted, ref } from "vue";
import { CreateImageElement } from "@/Utilities/useCreateCanvasElement.ts";
import { generalDefaults } from "@/config/settings.ts";
import { processFile } from "@/Utilities/FileProcessor.ts";
import { type IImageConfig, ImageGenModeEnum, type IUploadedImage } from "@/types.ts";

const emit = defineEmits<{
  (e: "add-element", action: any): void;
  (e: "completed"): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    for (const file of Array.from(target.files)) {
      const info = await processFile(file);
      handleAddingElement(info);
    }
    emit("completed");
  }
};
const handleCancel = () => {
  emit("completed");
};
const handleAddingElement = ({ name, image, imageUrl, base64 }: IUploadedImage) => {
  const element = CreateImageElement({
    name: name || "新圖片",
    image,
    imageUrl,
    base64
  });
  (element.config as IImageConfig).imageGenMode = ImageGenModeEnum.CUSTOM;
  emit("add-element", element);
};

onMounted(() => {
  fileInput.value?.click();
});
</script>

<template>
  <input
    type="file"
    ref="fileInput"
    @change="handleFileChange"
    @cancel="handleCancel"
    multiple
    :accept="generalDefaults.allowedExtensions.join(',')"
    hidden
  />
</template>

<style scoped lang="scss"></style>
