<script setup lang="ts">
import {computed, ref} from "vue";
import Symbols from "../Symbols.vue";
import { useAIGenStore } from "@/store/useAIGenStore.ts";
import {useImagesStore} from "@/store/images.ts";
import type {IImageConfig} from "@/types.ts";
import {processUrlToBase64} from "@/Utilities/FileProcessor.ts";
import {appearanceDefaults} from "@/config/settings.ts";
import {AlertMessage, PromptMessage} from "@/Utilities/AlertMessage.ts";
// import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";

const aiGenStore = useAIGenStore();
const imageStore = useImagesStore();

const emit = defineEmits(['refresh']);

// const styles = ref([...appearanceDefaults.AIStyles]);

const originalImage = computed(() => {
  if (imageStore.selectedElement) {
    const config = imageStore.selectedElement?.config;
    if (config.id && aiGenStore.hasOriginalImage(config.id)) {
      return aiGenStore.getOriginalImage(config.id)
    }
  }
  return null;
});
const prompt = ref<string>('');

const styles = computed(() => {
  const list = [];
  if (originalImage.value) list.push({
    name: '原始圖片',
    value: -1,
    key: 'original',
    url: originalImage.value.image.src
  });

  return [...list, ...appearanceDefaults.AIStyles];
})

const selectedStyle = ref<number>(-1);

const remainingTries = ref<Number>(10);

const selectStyle = (style: number) => {
  selectedStyle.value = style;
  if (selectedStyle.value !== 0) {
    prompt.value = '';
  }
};

const onSubmit = async () => {

  if (selectedStyle.value === -1) {
    await AlertMessage("請選擇風格");
    return;
  }
  if (selectedStyle.value === 0 && !prompt.value) {
    const message = await PromptMessage("請輸入提示詞").catch(() => {
      return { action: "cancel", value: '' };
    });
    if (message.action === "confirm" && message.value.trim().length > 0) prompt.value = message.value;
    else await AlertMessage("必須輸入提示詞");
  }

  const config = imageStore.selectedElement?.config as IImageConfig;
  if (config) {
    const id = config.id || -1;
    let image: HTMLImageElement;
    let base64: string;
    let result;
    if (!config.img || !config.base64) {
      const load = await processUrlToBase64(config.url || '');
      image = load.image;
      base64 = load.base64;
    } else {
      image = config.img;
      base64 = config.base64;
    }

    result = await aiGenStore.fetchGenerate({
      image,
      base64,
      id
    }, {
      choice: selectedStyle.value,
      prompt: prompt.value
    });
    if (result) {
      imageStore.replaceSelectedElementImage(result.image, result.base64);
      emit('refresh');
    }
  }
}

</script>

<template>
  <div class="images-gallery-container">
    <div class="heading">
      <h2>AI生成</h2>
      <div class="description">
        <span class="text">您今日AI换图剩余次数: </span>
        <span class="remaining-tries">{{ remainingTries }}</span>
      </div>
    </div>
    <div class="categories">
      <span class="label">風格轉換</span>
      <div class="category-group">
        <div
          v-for="style in styles"
          :key="style.key"
          class="item"
          @click="selectStyle(style.value)"
        >
          <div
              class="image"
              :class="{ selected: selectedStyle === style.value }"
          >
            <img :src="style.url" alt=""/>
          </div>
          <span>{{ style.name }}</span>
        </div>
      </div>
    </div>
    <el-button class="submit-btn" @pointerup="onSubmit">
      <template #default>
        <span>生成</span>
      </template>
      <template #loading>生成...</template>
      <template #icon><Symbols name="magic"/></template>
    </el-button>
  </div>
</template>

<style scoped lang="scss">

@use "@/styles/theme";

.images-gallery-container {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  overflow-y: hidden;
  padding-bottom: 24px;
  &::-webkit-scrollbar {
    display: none;
  }
}
.heading {
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  h2 {
    font-size: 21px;
    font-weight: 400;
  }
  .description {
    min-width: 0;
  }
  .text {
    font-size: 15px;
    font-weight: 400;
    color: theme.$text-color;
  }
  .remaining-tries {
    font-size: 15px;
    font-weight: 400;
    color: theme.$button-text-color;
  }
}
.categories {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;

  .category-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }

  .label {
    flex-shrink: 0;
  }
  .item {
    width: 80px;
    height: auto;
    display: flex;
    position: relative;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    cursor: pointer;
  }
  .image {
    position: relative;
    display: flex;
    width: 80px;
    height: 80px;
    max-height: 80px;
    max-width: 80px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 4px;
    margin-top: 5px;
    margin-bottom: 5px;
    box-sizing: border-box;
    overflow: hidden;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
      &:after {
        border: 2px solid #f15624;
      }
    }
    &.selected:after {
      border: 2px solid #f15624;
    }
    &:after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
.submit-btn {
  width: 100%;
  color: white;
  background-color: theme.$button-text-color;
  border-radius: 30px;
  border-color: theme.$button-text-color;
  &:hover {
    background-color: theme.$primary-color;
    border-color: theme.$button-text-color;
    color: theme.$button-text-color;
  }
}

</style>