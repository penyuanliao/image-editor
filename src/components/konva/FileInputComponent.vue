<script setup lang="ts">
import { processFile } from "../../Utilities/FileProcessor.ts";
import {UploadFilled} from "@element-plus/icons-vue";
import {ref} from "vue";
const props = defineProps(["images"])
const emits = defineEmits(["update:images", "change"])
const fileInput = ref<HTMLInputElement|null>(null);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const list: HTMLImageElement[] = props.images || [];
  if (target.files) {
    for (const file of Array.from(target.files)) {
      const { image } = await processFile(file);
      list.push(image);
    }
    emits('update:images', list);
    emits('change', list);
  }
};
const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <el-button
      class="upload-button"
      type="primary"
      @click="triggerFileInput">
    <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        multiple
        accept="image/*"
        hidden
    />
    <el-icon class="el-icon--left"><UploadFilled /></el-icon>
    上傳圖片
  </el-button>
</template>

<style scoped>

</style>